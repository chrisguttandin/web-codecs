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
        #ondequeue: null | [TEventHandler<this>, TEventHandler<this>];

        constructor(init: INativeAudioDecoderInit) {
            super();

            this.#internalAudioDecoder =
                nativeAudioDecoderConstructor === null ? new fakeAudioDecoderConstructor(init) : new nativeAudioDecoderConstructor(init);
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

        public flush(): Promise<undefined> {
            return this.#internalAudioDecoder.flush();
        }

        public reset(): void {
            return this.#internalAudioDecoder.reset();
        }

        public static isConfigSupported(config: INativeAudioDecoderConfig): Promise<INativeAudioDecoderSupport> {
            return nativeAudioDecoderConstructor === null
                ? fakeAudioDecoderConstructor.isConfigSupported(config)
                : nativeAudioDecoderConstructor.isConfigSupported(config);
        }
    };
};
