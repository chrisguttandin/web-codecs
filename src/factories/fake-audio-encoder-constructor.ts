import type { createIsKnownAudioCodec } from '../factories/is-known-codec';
import type { filterEntries as filterEntriesFunction } from '../functions/filter-entries';
import { INativeAudioEncoder, INativeAudioEncoderInit, INativeAudioEncoderSupport } from '../interfaces';
import { TNativeAudioEncoderConfig, TNativeCodecState, TNativeWebCodecsErrorCallback } from '../types';

export const createFakeAudioEncoderConstructor = (
    filterEntries: typeof filterEntriesFunction,
    isKnownCodec: ReturnType<typeof createIsKnownAudioCodec>
) =>
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

        public configure(config: TNativeAudioEncoderConfig): void {
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

        public flush(): Promise<void> {
            return Promise.reject(new DOMException("Failed to execute 'flush' on 'AudioEncoder'.", 'InvalidStateError'));
        }

        public reset(): void {
            if (this.#state === 'closed') {
                throw new DOMException("Failed to execute 'reset' on 'AudioEncoder'.", 'InvalidStateError');
            }
        }

        public static isConfigSupported(config: TNativeAudioEncoderConfig): Promise<INativeAudioEncoderSupport> {
            return new Promise<INativeAudioEncoderSupport>((resolve, reject) => {
                if (isKnownCodec(config.codec) && config.numberOfChannels > 0 && config.sampleRate > 0) {
                    resolve({
                        config: {
                            bitrateMode: 'variable',
                            ...filterEntries(
                                Object.entries(config).map(([key, value]) => {
                                    if (key === 'aac') {
                                        return [key, filterEntries(Object.entries(value), 'format')];
                                    }

                                    if (key === 'flac') {
                                        return [key, filterEntries(Object.entries(value), 'blockSize', 'complexity')];
                                    }

                                    if (key === 'opus') {
                                        return [
                                            key,
                                            filterEntries(
                                                Object.entries(value),
                                                'application',
                                                'complexity',
                                                'format',
                                                'frameDuration',
                                                'packetlossperc',
                                                'signal',
                                                'usedtx',
                                                'useinbandfec'
                                            )
                                        ];
                                    }

                                    return [key, value];
                                }),
                                'aac',
                                'bitrate',
                                'bitrateMode',
                                'codec',
                                'flac',
                                'numberOfChannels',
                                'opus',
                                'sampleRate'
                            )
                        },
                        supported: false
                    });
                } else {
                    reject(new TypeError("Failed to execute 'isConfigSupported' on 'AudioEncoder'."));
                }
            });
        }
    };
