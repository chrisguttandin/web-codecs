import {
    INativeAudioData,
    INativeAudioEncoder,
    INativeAudioEncoderConstructor,
    INativeAudioEncoderInit,
    INativeAudioEncoderSupport
} from '../interfaces';
import { TEventHandler, TNativeAudioEncoderConfig, TNativeCodecState } from '../types';
import type { createFakeAudioEncoderConstructor } from './fake-audio-encoder-constructor';
import type { createNativeAudioEncoderConstructor } from './native-audio-encoder-constructor';
import type { createReadVorbisConfig } from './read-vorbis-config';

export const createAudioEncoderConstructor = (
    fakeAudioEncoderConstructor: ReturnType<typeof createFakeAudioEncoderConstructor>,
    nativeAudioDatas: WeakMap<INativeAudioData, INativeAudioData>,
    nativeAudioEncoderConstructor: ReturnType<typeof createNativeAudioEncoderConstructor>,
    readVorbisConfig: ReturnType<typeof createReadVorbisConfig>
): INativeAudioEncoderConstructor => {
    return class AudioEncoder extends EventTarget implements INativeAudioEncoder {
        // tslint:disable-next-line:member-access
        #expectedNextTimestamp: number;

        // tslint:disable-next-line:member-access
        #internalAudioEncoder: Omit<INativeAudioEncoder, 'ondequeue'>;

        // tslint:disable-next-line:member-access
        #ondequeue: null | [TEventHandler<this>, TEventHandler<this>];

        constructor(init: INativeAudioEncoderInit) {
            super();

            let vorbisConfig: ReturnType<typeof readVorbisConfig> = null;

            this.#expectedNextTimestamp = 0;
            // Bug #6: AudioEncoder is not yet implemented in Safari.
            this.#internalAudioEncoder =
                nativeAudioEncoderConstructor === null
                    ? new fakeAudioEncoderConstructor(init)
                    : new nativeAudioEncoderConstructor({
                          ...init,
                          ...(typeof init.output === 'function'
                              ? {
                                    output: (encodedAudioChunk, ...args) => {
                                        const description = args[0].decoderConfig?.description;

                                        if (description !== undefined) {
                                            vorbisConfig = readVorbisConfig(description);
                                        }

                                        if (vorbisConfig === null) {
                                            const { duration } = encodedAudioChunk;

                                            // Bug #12: Chrome sometimes gets the duration slightly wrong.
                                            if (duration !== null) {
                                                const stringifiedDuration = duration.toString();

                                                if (/001|334$/.test(stringifiedDuration)) {
                                                    Object.defineProperty(encodedAudioChunk, 'duration', { get: () => duration - 1 });
                                                } else if (/999$/.test(stringifiedDuration)) {
                                                    Object.defineProperty(encodedAudioChunk, 'duration', { get: () => duration + 1 });
                                                }
                                            }
                                        } else {
                                            // Bug #21: Firefox computes a wrong duration when encoding as vorbis.
                                            const uint8Array = new Uint8Array(encodedAudioChunk.byteLength);

                                            encodedAudioChunk.copyTo(uint8Array);

                                            const currentBlockSize =
                                                vorbisConfig.blocksizes[
                                                    // tslint:disable-next-line:no-bitwise
                                                    vorbisConfig.modeBlockflags[(uint8Array[0] >> 1) & vorbisConfig.modeMask]
                                                ];
                                            const duration = Math.floor(
                                                ((vorbisConfig.prevBlockSize === null
                                                    ? 0
                                                    : (vorbisConfig.prevBlockSize + currentBlockSize) / 4) /
                                                    vorbisConfig.sampleRate) *
                                                    1000000
                                            );

                                            vorbisConfig.prevBlockSize = currentBlockSize;

                                            if (encodedAudioChunk.duration !== duration) {
                                                Object.defineProperty(encodedAudioChunk, 'duration', { get: () => duration });
                                            }
                                        }

                                        // Bug #13: Chrome sometimes gets the timestamp slightly wrong.
                                        if (encodedAudioChunk.timestamp.toString().endsWith('999')) {
                                            const timestamp = encodedAudioChunk.timestamp + 1;

                                            Object.defineProperty(encodedAudioChunk, 'timestamp', { get: () => timestamp });
                                        }

                                        // Bug #20: Firefox removes the pre-skip samples when computing the timestamp when encoding as opus.
                                        if (Math.abs(this.#expectedNextTimestamp - encodedAudioChunk.timestamp) > 1) {
                                            const timestamp = this.#expectedNextTimestamp;

                                            Object.defineProperty(encodedAudioChunk, 'timestamp', { get: () => timestamp });
                                        }

                                        this.#expectedNextTimestamp = encodedAudioChunk.timestamp + (encodedAudioChunk.duration ?? 0);

                                        init.output(encodedAudioChunk, ...args);
                                    }
                                }
                              : {})
                      });
            this.#ondequeue = null;
        }

        public get encodeQueueSize(): number {
            return this.#internalAudioEncoder.encodeQueueSize;
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
            return this.#internalAudioEncoder.state;
        }

        public close(): void {
            return this.#internalAudioEncoder.close();
        }

        public configure(config: TNativeAudioEncoderConfig): void {
            // Bug #9 & #10: Chrome does not throw a TypeError if numberOfChannels or sampleRate are zero.
            if (nativeAudioEncoderConstructor === null || (config.numberOfChannels > 0 && config.sampleRate > 0)) {
                return this.#internalAudioEncoder.configure(config);
            }

            throw new TypeError("Failed to execute 'configure' on 'AudioEncoder'.");
        }

        public encode(data: INativeAudioData): void {
            return this.#internalAudioEncoder.encode(nativeAudioDatas.get(data) ?? data);
        }

        public flush(): Promise<void> {
            return this.#internalAudioEncoder.flush();
        }

        public reset(): void {
            this.#expectedNextTimestamp = 0;

            return this.#internalAudioEncoder.reset();
        }

        public static isConfigSupported(config: TNativeAudioEncoderConfig): Promise<INativeAudioEncoderSupport> {
            return nativeAudioEncoderConstructor === null
                ? fakeAudioEncoderConstructor.isConfigSupported(config)
                : nativeAudioEncoderConstructor
                      .isConfigSupported(config)
                      // Bug #7 & #9: Chrome does not throw a TypeError if numberOfChannels or sampleRate are zero.
                      .then((audioEncoderSupport) => {
                          if (audioEncoderSupport.config.numberOfChannels === 0 || audioEncoderSupport.config.sampleRate === 0) {
                              throw new TypeError("Failed to execute 'isConfigSupported' on 'AudioEncoder'.");
                          }

                          return audioEncoderSupport;
                      });
        }
    };
};
