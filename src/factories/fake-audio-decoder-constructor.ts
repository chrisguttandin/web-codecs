import type { createIsKnownAudioCodec } from '../factories/is-known-codec';
import { INativeAudioDecoder, INativeAudioDecoderConfig, INativeAudioDecoderInit, INativeAudioDecoderSupport } from '../interfaces';
import { TNativeCodecState, TNativeWebCodecsErrorCallback } from '../types';

export const createFakeAudioDecoderConstructor = (isKnownCodec: ReturnType<typeof createIsKnownAudioCodec>) =>
    class FakeAudioDecoder extends EventTarget implements Omit<INativeAudioDecoder, 'ondequeue'> {
        // tslint:disable-next-line:member-access
        #decodeQueueSize: number;

        // tslint:disable-next-line:member-access
        #error: TNativeWebCodecsErrorCallback;

        // tslint:disable-next-line:member-access
        #state: TNativeCodecState;

        constructor(init: INativeAudioDecoderInit) {
            super();

            if (init.error === undefined || init.output === undefined) {
                throw new TypeError("Failed to construct 'AudioDecoder'.");
            }

            this.#decodeQueueSize = 0;
            this.#error = init.error;
            this.#state = 'unconfigured';
        }

        public get decodeQueueSize(): number {
            return this.#decodeQueueSize;
        }

        public get state(): TNativeCodecState {
            return this.#state;
        }

        public close(): void {
            if (this.#state === 'closed') {
                throw new DOMException("Failed to execute 'close' on 'AudioDecoder'.", 'InvalidStateError');
            }

            this.#state = 'closed';
        }

        public configure(config: INativeAudioDecoderConfig): void {
            if (!isKnownCodec(config.codec)) {
                throw new TypeError("Failed to execute 'configure' on 'AudioDecoder'.");
            }

            if (this.#state === 'closed') {
                throw new DOMException("Failed to execute 'configure' on 'AudioDecoder'.", 'InvalidStateError');
            }

            this.#state = 'configured';

            setTimeout(() => {
                this.#state = 'closed';
                this.#error(new DOMException("Failed to execute 'configure' on 'AudioDecoder'.", 'NotSupportedError'));
            });
        }

        public decode(): void {
            throw new DOMException("Failed to execute 'decode' on 'AudioDecoder'.", 'InvalidStateError');
        }

        public flush(): Promise<void> {
            return Promise.reject(new DOMException("Failed to execute 'flush' on 'AudioDecoder'.", 'InvalidStateError'));
        }

        public reset(): void {
            if (this.#state === 'closed') {
                throw new DOMException("Failed to execute 'reset' on 'AudioDecoder'.", 'InvalidStateError');
            }
        }

        public static isConfigSupported(config: INativeAudioDecoderConfig): Promise<INativeAudioDecoderSupport> {
            return new Promise<INativeAudioDecoderSupport>((resolve, reject) => {
                if (isKnownCodec(config.codec)) {
                    resolve({
                        config: <INativeAudioDecoderConfig>(
                            Object.fromEntries(
                                Object.entries(config).filter(([key]) =>
                                    ['codec', 'description', 'numberOfChannels', 'sampleRate'].includes(key)
                                )
                            )
                        ),
                        supported: false
                    });
                } else {
                    reject(new TypeError("Failed to execute 'isConfigSupported' on 'AudioDecoder'."));
                }
            });
        }
    };
