import { INativeAudioData, INativeAudioDataCopyToOptions, INativeAudioDataInit } from '../interfaces';
import { TNativeAudioDataConstructor, TNativeAudioSampleFormat } from '../types';
import type { createFakeAudioDataConstructor } from './fake-audio-data-constructor';
import type { createNativeAudioDataConstructor } from './native-audio-data-constructor';

export const createAudioDataConstructor = (
    fakeAudioDataConstructor: ReturnType<typeof createFakeAudioDataConstructor>,
    nativeAudioDataConstructor: ReturnType<typeof createNativeAudioDataConstructor>,
    nativeAudioDatas: WeakMap<INativeAudioData, INativeAudioData>
): TNativeAudioDataConstructor => {
    const copySymbol = Symbol();

    return class AudioData implements INativeAudioData {
        // tslint:disable-next-line:member-access
        #internalAudioData: INativeAudioData;

        constructor(init: INativeAudioDataInit);
        constructor(symbol: typeof copySymbol, internalAudioData: INativeAudioData);
        constructor(initOrSymbol: typeof copySymbol | INativeAudioDataInit, internalAudioData?: INativeAudioData) {
            if (initOrSymbol === copySymbol) {
                if (internalAudioData === undefined) {
                    throw new Error('Expecting internalAudioData when using the symbol.');
                }

                this.#internalAudioData = internalAudioData;
            } else {
                try {
                    // Bug #1: AudioData is not yet implemented in Firefox and Safari.
                    this.#internalAudioData =
                        nativeAudioDataConstructor === null
                            ? new fakeAudioDataConstructor(initOrSymbol)
                            : new nativeAudioDataConstructor(initOrSymbol);
                } catch (err) {
                    // Bug #2: Chrome does not throw a TypeError when the sampleRate is less than or equal to zero.
                    if (err.code === 9 && initOrSymbol.sampleRate <= 0) {
                        throw new TypeError("Failed to construct 'AudioData'.");
                    }

                    throw err;
                }
            }

            if (nativeAudioDataConstructor !== null) {
                nativeAudioDatas.set(this, this.#internalAudioData);
            }
        }

        public get duration(): number {
            return this.#internalAudioData.duration;
        }

        public get format(): null | TNativeAudioSampleFormat {
            return this.#internalAudioData.format;
        }

        public get numberOfChannels(): number {
            return this.#internalAudioData.numberOfChannels;
        }

        public get numberOfFrames(): number {
            return this.#internalAudioData.numberOfFrames;
        }

        public get sampleRate(): number {
            return this.#internalAudioData.sampleRate;
        }

        public get timestamp(): number {
            return this.#internalAudioData.timestamp;
        }

        public allocationSize(options: INativeAudioDataCopyToOptions): number {
            return this.#internalAudioData.allocationSize(options);
        }

        public clone(): INativeAudioData {
            return new AudioData(copySymbol, this.#internalAudioData.clone());
        }

        public close(): void {
            return this.#internalAudioData.close();
        }

        public copyTo(destination: BufferSource, options: INativeAudioDataCopyToOptions): void {
            return this.#internalAudioData.copyTo(destination, options);
        }
    };
};
