import {
    IAudioDecoderConstructor,
    INativeAudioDecoder,
    INativeAudioDecoderConfig,
    INativeAudioDecoderInit,
    INativeAudioDecoderSupport,
    INativeEncodedAudioChunk
} from '../interfaces';
import { TEventHandler, TNativeCodecState } from '../types';
import type { createFakeAudioDecoderConstructor } from './fake-audio-decoder-constructor';
import type { createNativeAudioDecoderConstructor } from './native-audio-decoder-constructor';

export const createAudioDecoderConstructor = (
    fakeAudioDecoderConstructor: ReturnType<typeof createFakeAudioDecoderConstructor>,
    nativeAudioDecoderConstructor: ReturnType<typeof createNativeAudioDecoderConstructor>,
    nativeEncodedAudioChunks: WeakMap<INativeEncodedAudioChunk, INativeEncodedAudioChunk>
): IAudioDecoderConstructor => {
    return class AudioDecoder extends EventTarget implements INativeAudioDecoder {
        // tslint:disable-next-line:member-access
        #internalAudioDecoder: Omit<INativeAudioDecoder, 'ondequeue'>;

        // tslint:disable-next-line:member-access
        #numberOfFrames: null | number = null;

        // tslint:disable-next-line:member-access
        #ondequeue: null | [TEventHandler<this>, TEventHandler<this>];

        constructor(init: INativeAudioDecoderInit) {
            super();

            // Bug #5: AudioDecoder is not yet implemented in Safari.
            this.#internalAudioDecoder =
                nativeAudioDecoderConstructor === null
                    ? new fakeAudioDecoderConstructor(init)
                    : new nativeAudioDecoderConstructor({
                          ...init,
                          ...(typeof init.output === 'function'
                              ? {
                                    // Bug #11: Chrome sometimes gets the timestamp slightly wrong.
                                    output: (audioData) => {
                                        const timestamp =
                                            this.#numberOfFrames === null
                                                ? audioData.timestamp
                                                : Math.floor((this.#numberOfFrames * 1000000) / audioData.sampleRate);

                                        if (this.#numberOfFrames === null) {
                                            this.#numberOfFrames = Math.round((timestamp * audioData.sampleRate) / 1000000);
                                        } else if (audioData.timestamp !== timestamp) {
                                            Object.defineProperty(audioData, 'timestamp', { get: () => timestamp });
                                        }

                                        this.#numberOfFrames += audioData.numberOfFrames;

                                        init.output(audioData);
                                    }
                                }
                              : {})
                      });
            this.#ondequeue = null;
        }

        public get decodeQueueSize(): number {
            return this.#internalAudioDecoder.decodeQueueSize;
        }

        public get ondequeue(): null | TEventHandler<this> {
            return this.#ondequeue === null ? this.#ondequeue : this.#ondequeue[0];
        }

        set ondequeue(value) {
            if (this.#ondequeue !== null) {
                this.removeEventListener('dequeue', this.#ondequeue[1]);
            }

            if (typeof value === 'function') {
                const boundListener = value.bind(this);

                this.addEventListener('dequeue', boundListener);

                this.#ondequeue = [value, boundListener];
            } else {
                this.#ondequeue = null;
            }
        }

        public get state(): TNativeCodecState {
            return this.#internalAudioDecoder.state;
        }

        public close(): void {
            return this.#internalAudioDecoder.close();
        }

        public configure(config: INativeAudioDecoderConfig): void {
            return this.#internalAudioDecoder.configure(config);
        }

        public decode(chunk: INativeEncodedAudioChunk): void {
            return this.#internalAudioDecoder.decode(nativeEncodedAudioChunks.get(chunk) ?? chunk);
        }

        public flush(): Promise<void> {
            return this.#internalAudioDecoder.flush();
        }

        public reset(): void {
            this.#numberOfFrames = null;

            return this.#internalAudioDecoder.reset();
        }

        public static isConfigSupported(config: INativeAudioDecoderConfig): Promise<INativeAudioDecoderSupport> {
            return nativeAudioDecoderConstructor === null
                ? fakeAudioDecoderConstructor.isConfigSupported(config)
                : nativeAudioDecoderConstructor.isConfigSupported(config);
        }
    };
};
