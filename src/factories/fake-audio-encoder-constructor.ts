import type { createIsKnownAudioCodec } from '../factories/is-known-codec';
import { INativeAudioEncoder, INativeAudioEncoderConfig, INativeAudioEncoderInit, INativeAudioEncoderSupport } from '../interfaces';
import { TNativeCodecState, TNativeWebCodecsErrorCallback } from '../types';

export const createFakeAudioEncoderConstructor = (isKnownCodec: ReturnType<typeof createIsKnownAudioCodec>) =>
    class FakeAudioEncoder extends EventTarget implements Omit<INativeAudioEncoder, 'ondequeue'> {
        // tslint:disable-next-line:member-access
        #encodeQueueSize: number;

        // tslint:disable-next-line:member-access
        #error: TNativeWebCodecsErrorCallback;

        // tslint:disable-next-line:member-access
        #state: TNativeCodecState;

        constructor(init: INativeAudioEncoderInit) {
            super();

            if (init.error === undefined || init.output === undefined) {
                throw new TypeError("Failed to construct 'AudioEncoder'.");
            }

            this.#encodeQueueSize = 0;
            this.#error = init.error;
            this.#state = 'unconfigured';
        }

        public get encodeQueueSize(): number {
            return this.#encodeQueueSize;
        }

        public get state(): TNativeCodecState {
            return this.#state;
        }

        public close(): void {
            if (this.#state === 'closed') {
                throw new DOMException("Failed to execute 'close' on 'AudioEncoder'.", 'InvalidStateError');
            }

            this.#state = 'closed';
        }

        public configure(config: INativeAudioEncoderConfig): void {
            if (isKnownCodec(config.codec) && config.numberOfChannels > 0 && config.sampleRate > 0) {
                if (this.#state === 'closed') {
                    throw new DOMException("Failed to execute 'configure' on 'AudioEncoder'.", 'InvalidStateError');
                }

                this.#state = 'configured';

                setTimeout(() => {
                    this.#state = 'closed';
                    this.#error(new DOMException("Failed to execute 'configure' on 'AudioEncoder'.", 'NotSupportedError'));
                });
            } else {
                throw new TypeError("Failed to execute 'configure' on 'AudioEncoder'.");
            }
        }

        public encode(): void {
            throw new DOMException("Failed to execute 'encode' on 'AudioEncoder'.", 'InvalidStateError');
        }

        public flush(): Promise<undefined> {
            return Promise.reject(new DOMException("Failed to execute 'flush' on 'AudioEncoder'.", 'InvalidStateError'));
        }

        public reset(): void {
            if (this.#state === 'closed') {
                throw new DOMException("Failed to execute 'reset' on 'AudioEncoder'.", 'InvalidStateError');
            }
        }

        public static isConfigSupported(config: INativeAudioEncoderConfig): Promise<INativeAudioEncoderSupport> {
            return new Promise<INativeAudioEncoderSupport>((resolve, reject) => {
                if (isKnownCodec(config.codec) && config.numberOfChannels > 0 && config.sampleRate > 0) {
                    resolve({
                        config: {
                            bitrateMode: 'variable',
                            ...(<INativeAudioEncoderConfig>(
                                Object.fromEntries(
                                    Object.entries(config).filter(([key]) =>
                                        ['bitrate', 'bitrateMode', 'codec', 'numberOfChannels', 'sampleRate'].includes(key)
                                    )
                                )
                            ))
                        },
                        supported: false
                    });
                } else {
                    reject(new TypeError("Failed to execute 'isConfigSupported' on 'AudioEncoder'."));
                }
            });
        }
    };
