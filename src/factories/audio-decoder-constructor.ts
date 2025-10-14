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
import type { createNativeEncodedAudioChunkConstructor } from './native-encoded-audio-chunk-constructor';
import type { createTestFlacDecodingSupport } from './test-flac-decoding-support';
import type { createTestMp3DecoderDelaySupport } from './test-mp3-decoder-delay-support';

export const createAudioDecoderConstructor = (
    fakeAudioDecoderConstructor: ReturnType<typeof createFakeAudioDecoderConstructor>,
    nativeAudioDecoderConstructor: ReturnType<typeof createNativeAudioDecoderConstructor>,
    nativeEncodedAudioChunkConstructor: ReturnType<typeof createNativeEncodedAudioChunkConstructor>,
    nativeEncodedAudioChunks: WeakMap<INativeEncodedAudioChunk, INativeEncodedAudioChunk>,
    testFlacDecodingSupport: ReturnType<typeof createTestFlacDecodingSupport>,
    testMp3DecoderDelaySupport: ReturnType<typeof createTestMp3DecoderDelaySupport>
): IAudioDecoderConstructor => {
    return class AudioDecoder extends EventTarget implements INativeAudioDecoder {
        // tslint:disable-next-line:member-access
        #init: INativeAudioDecoderInit;

        // tslint:disable-next-line:member-access
        #internalAudioDecoder: Omit<INativeAudioDecoder, 'ondequeue'>;

        // tslint:disable-next-line:member-access
        #numberOfFrames: null | number = null;

        // tslint:disable-next-line:member-access
        #ondequeue: null | [TEventHandler<this>, TEventHandler<this>];

        // tslint:disable-next-line:member-access
        #promisedMp3DecoderDelaySupportResult: null | ReturnType<typeof testMp3DecoderDelaySupport> = null;

        constructor(init: INativeAudioDecoderInit) {
            super();

            this.#init = init;
            // Bug #5: AudioDecoder is not yet implemented in Safari.
            this.#internalAudioDecoder =
                nativeAudioDecoderConstructor === null
                    ? new fakeAudioDecoderConstructor(init)
                    : new nativeAudioDecoderConstructor({
                          ...init,
                          ...(typeof init.output === 'function'
                              ? {
                                    output: (audioData) => {
                                        // Bug #31: Safari skips the decoder delay when decoding an MP3 file.
                                        if (
                                            this.#promisedMp3DecoderDelaySupportResult !== null &&
                                            [529, 623].includes(audioData.numberOfFrames)
                                        ) {
                                            return;
                                        }

                                        // Bug #11: Chrome sometimes gets the timestamp slightly wrong.
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
            const { codec } = config;

            if (codec === 'mp3') {
                this.#promisedMp3DecoderDelaySupportResult = testMp3DecoderDelaySupport();
            } else if (codec === 'flac') {
                // Bug #30: Safari pretends to support decoding FLAC but then fails when doing so.
                testFlacDecodingSupport().then((result) => {
                    if (!result) {
                        this.#internalAudioDecoder.close();
                        this.#init.error(new DOMException("Failed to execute 'configure' on 'AudioDecoder'.", 'NotSupportedError'));
                    }
                });
            }

            return this.#internalAudioDecoder.configure(config);
        }

        public decode(chunk: INativeEncodedAudioChunk): void {
            // Bug #31: Safari skips the decoder delay when decoding an MP3 file.
            if (this.#promisedMp3DecoderDelaySupportResult === null) {
                return this.#internalAudioDecoder.decode(nativeEncodedAudioChunks.get(chunk) ?? chunk);
            }

            this.#promisedMp3DecoderDelaySupportResult = this.#promisedMp3DecoderDelaySupportResult.then((result) => {
                if (this.#promisedMp3DecoderDelaySupportResult !== null) {
                    if (nativeEncodedAudioChunkConstructor !== null && result) {
                        const data = new Uint8Array(chunk.byteLength);

                        chunk.copyTo(data);

                        for (let i = 4; i < data.length; i += 1) {
                            data[i] = 0;
                        }

                        this.#internalAudioDecoder.decode(
                            new nativeEncodedAudioChunkConstructor({
                                data,
                                timestamp: chunk.timestamp - (chunk.duration ?? 0),
                                type: 'key'
                            })
                        );
                    }

                    this.#internalAudioDecoder.decode(nativeEncodedAudioChunks.get(chunk) ?? chunk);
                }

                return false;
            });
        }

        public flush(): Promise<void> {
            if (this.#promisedMp3DecoderDelaySupportResult === null) {
                return this.#internalAudioDecoder.flush();
            }

            return this.#promisedMp3DecoderDelaySupportResult.then(() => this.#internalAudioDecoder.flush());
        }

        public reset(): void {
            this.#numberOfFrames = null;
            this.#promisedMp3DecoderDelaySupportResult = null;

            return this.#internalAudioDecoder.reset();
        }

        public static isConfigSupported(config: INativeAudioDecoderConfig): Promise<INativeAudioDecoderSupport> {
            return nativeAudioDecoderConstructor === null
                ? fakeAudioDecoderConstructor.isConfigSupported(config)
                : config.codec === 'flac'
                  ? nativeAudioDecoderConstructor.isConfigSupported(config).then((audioDecoderSupport) =>
                        // Bug #30: Safari pretends to support decoding FLAC but then fails when doing so.
                        testFlacDecodingSupport().then((result) => {
                            if (!result) {
                                return { ...audioDecoderSupport, supported: result };
                            }

                            return audioDecoderSupport;
                        })
                    )
                  : nativeAudioDecoderConstructor.isConfigSupported(config);
        }
    };
};
