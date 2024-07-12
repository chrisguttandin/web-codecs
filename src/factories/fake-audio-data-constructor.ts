import type { computeCopyElementCount as computeCopyElementCountFunction } from '../functions/compute-copy-element-count';
import type { convertBufferSourceToTypedArray as convertBufferSourceToTypedArrayFunction } from '../functions/convert-buffer-source-to-typed-array';
import type { convertFloat32ToInt16 as convertFloat32ToInt16Function } from '../functions/convert-float32-to-int16';
import type { convertFloat32ToInt32 as convertFloat32ToInt32Function } from '../functions/convert-float32-to-int32';
import type { convertFloat32ToUint8 as convertFloat32ToUint8Function } from '../functions/convert-float32-to-uint8';
import type { convertInt16ToFloat32 as convertInt16ToFloat32Function } from '../functions/convert-int16-to-float32';
import type { convertInt16ToInt32 as convertInt16ToInt32Function } from '../functions/convert-int16-to-int32';
import type { convertInt16ToUint8 as convertInt16ToUint8Function } from '../functions/convert-int16-to-uint8';
import type { convertInt32ToFloat32 as convertInt32ToFloat32Function } from '../functions/convert-int32-to-float32';
import type { convertInt32ToInt16 as convertInt32ToInt16Function } from '../functions/convert-int32-to-int16';
import type { convertInt32ToUint8 as convertInt32ToUint8Function } from '../functions/convert-int32-to-uint8';
import type { convertUint8ToFloat32 as convertUint8ToFloat32Function } from '../functions/convert-uint8-to-float32';
import type { convertUint8ToInt16 as convertUint8ToInt16Function } from '../functions/convert-uint8-to-int16';
import type { convertUint8ToInt32 as convertUint8ToInt32Function } from '../functions/convert-uint8-to-int32';
import { INativeAudioData, INativeAudioDataCopyToOptions, INativeAudioDataInit } from '../interfaces';
import { TNativeAudioSampleFormat } from '../types';

export const createFakeAudioDataConstructor = (
    computeCopyElementCount: typeof computeCopyElementCountFunction,
    convertBufferSourceToTypedArray: typeof convertBufferSourceToTypedArrayFunction,
    convertFloat32ToInt16: typeof convertFloat32ToInt16Function,
    convertFloat32ToInt32: typeof convertFloat32ToInt32Function,
    convertFloat32ToUint8: typeof convertFloat32ToUint8Function,
    convertInt16ToFloat32: typeof convertInt16ToFloat32Function,
    convertInt16ToInt32: typeof convertInt16ToInt32Function,
    convertInt16ToUint8: typeof convertInt16ToUint8Function,
    convertInt32ToFloat32: typeof convertInt32ToFloat32Function,
    convertInt32ToInt16: typeof convertInt32ToInt16Function,
    convertInt32ToUint8: typeof convertInt32ToUint8Function,
    convertUint8ToFloat32: typeof convertUint8ToFloat32Function,
    convertUint8ToInt16: typeof convertUint8ToInt16Function,
    convertUint8ToInt32: typeof convertUint8ToInt32Function
) =>
    class FakeAudioData implements INativeAudioData {
        // tslint:disable-next-line:member-access
        #data: BufferSource;

        // tslint:disable-next-line:member-access
        #duration: number;

        // tslint:disable-next-line:member-access
        #format: null | TNativeAudioSampleFormat;

        // tslint:disable-next-line:member-access
        #numberOfChannels: number;

        // tslint:disable-next-line:member-access
        #numberOfFrames: number;

        // tslint:disable-next-line:member-access
        #sampleRate: number;

        // tslint:disable-next-line:member-access
        #timestamp: number;

        constructor(init: INativeAudioDataInit) {
            if (
                init.data === undefined ||
                init.format === undefined ||
                init.numberOfChannels === undefined ||
                init.numberOfChannels <= 0 ||
                init.numberOfFrames === undefined ||
                init.numberOfFrames <= 0 ||
                init.sampleRate === undefined ||
                init.sampleRate <= 0 ||
                init.timestamp === undefined
            ) {
                throw new TypeError("Failed to construct 'AudioData'.");
            }

            const expectedNumberOfBytes =
                (init.numberOfFrames * init.numberOfChannels * parseInt(init.format.slice(1).split('-')[0], 10)) / 8;

            if (init.data.byteLength < expectedNumberOfBytes) {
                throw new TypeError("Failed to construct 'AudioData'.");
            }

            if (init.transfer !== undefined) {
                if (init.transfer.length !== new Set(init.transfer).size) {
                    throw new DOMException("Failed to construct 'AudioData'.", 'DataCloneError');
                }

                for (const arrayBuffer of init.transfer) {
                    const { port1 } = new MessageChannel();

                    port1.postMessage(arrayBuffer, [arrayBuffer]);
                    port1.close();
                }
            }

            this.#data = init.data;
            this.#duration = (init.numberOfFrames / init.sampleRate) * 1000000;
            this.#format = init.format;
            this.#numberOfChannels = init.numberOfChannels;
            this.#numberOfFrames = init.numberOfFrames;
            this.#sampleRate = init.sampleRate;
            this.#timestamp = init.timestamp;
        }

        public get duration(): number {
            return this.#duration;
        }

        public get format(): null | TNativeAudioSampleFormat {
            return this.#format;
        }

        public get numberOfChannels(): number {
            return this.#numberOfChannels;
        }

        public get numberOfFrames(): number {
            return this.#numberOfFrames;
        }

        public get sampleRate(): number {
            return this.#sampleRate;
        }

        public get timestamp(): number {
            return this.#timestamp;
        }

        public allocationSize(options: INativeAudioDataCopyToOptions): number {
            if (this.#format === null) {
                throw new DOMException("Failed to execute 'allocationSize' on 'AudioData'.", 'InvalidStateError');
            }

            const format = options.format ?? this.#format;

            const frameOffset = options.frameOffset ?? 0;
            const frameCount = this.#numberOfFrames - frameOffset;
            const elementCount = computeCopyElementCount(
                format,
                frameCount,
                frameOffset,
                this.#numberOfChannels,
                this.#numberOfFrames,
                options.planeIndex
            );
            const bytesPerSample = parseInt(format.slice(1).split('-')[0], 10) / 8;

            return elementCount * bytesPerSample;
        }

        public clone(): INativeAudioData {
            if (this.#format === null) {
                throw new DOMException("Failed to execute 'clone' on 'AudioData'.", 'InvalidStateError');
            }

            const data = new Uint8Array(this.#data.byteLength);

            data.set(convertBufferSourceToTypedArray(this.#data, Uint8Array));

            return new FakeAudioData({
                data,
                format: this.#format,
                numberOfChannels: this.#numberOfChannels,
                numberOfFrames: this.#numberOfFrames,
                sampleRate: this.#sampleRate,
                timestamp: this.#timestamp
            });
        }

        public close(): void {
            this.#duration = 0;
            this.#numberOfChannels = 0;
            this.#numberOfFrames = 0;
            this.#sampleRate = 0;
            this.#format = null;
        }

        public copyTo(destination: BufferSource, options: INativeAudioDataCopyToOptions): void {
            if (this.#format === null) {
                throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'InvalidStateError');
            }

            const format = options.format ?? this.#format;
            const frameOffset = options.frameOffset ?? 0;
            const frameCount = this.#numberOfFrames - frameOffset;
            const elementCount = computeCopyElementCount(
                format,
                frameCount,
                frameOffset,
                this.#numberOfChannels,
                this.#numberOfFrames,
                options.planeIndex
            );
            const bytesPerSample = parseInt(format.slice(1).split('-')[0], 10) / 8;

            if (elementCount * bytesPerSample > destination.byteLength) {
                throw new RangeError("Failed to execute 'copyTo' on 'AudioData'.");
            }

            const convertValue = format.startsWith('f32')
                ? this.#format.startsWith('f32')
                    ? (value: number) => value
                    : this.#format.startsWith('s16')
                      ? convertInt16ToFloat32
                      : this.#format.startsWith('s32')
                        ? convertInt32ToFloat32
                        : convertUint8ToFloat32
                : format.startsWith('s16')
                  ? this.#format.startsWith('f32')
                      ? convertFloat32ToInt16
                      : this.#format.startsWith('s16')
                        ? (value: number) => value
                        : this.#format.startsWith('s32')
                          ? convertInt32ToInt16
                          : convertUint8ToInt16
                  : format.startsWith('s32')
                    ? this.#format.startsWith('f32')
                        ? convertFloat32ToInt32
                        : this.#format.startsWith('s16')
                          ? convertInt16ToInt32
                          : this.#format.startsWith('s32')
                            ? (value: number) => value
                            : convertUint8ToInt32
                    : this.#format.startsWith('f32')
                      ? convertFloat32ToUint8
                      : this.#format.startsWith('s16')
                        ? convertInt16ToUint8
                        : this.#format.startsWith('s32')
                          ? convertInt32ToUint8
                          : (value: number) => value;
            const destinationArray = convertBufferSourceToTypedArray(
                destination,
                format.startsWith('f32')
                    ? Float32Array
                    : format.startsWith('s16')
                      ? Int16Array
                      : format.startsWith('s32')
                        ? Int32Array
                        : Uint8Array
            );
            const sourceArray = convertBufferSourceToTypedArray(
                this.#data,
                this.#format.startsWith('f32')
                    ? Float32Array
                    : this.#format.startsWith('s16')
                      ? Int16Array
                      : this.#format.startsWith('s32')
                        ? Int32Array
                        : Uint8Array
            );

            if (format.endsWith('-planar')) {
                if (this.#format.endsWith('-planar')) {
                    for (
                        let destinationIndex = 0, sourceIndex = this.numberOfFrames * options.planeIndex;
                        destinationIndex < elementCount;
                        destinationIndex += 1, sourceIndex += 1
                    ) {
                        destinationArray[destinationIndex] = convertValue(sourceArray[sourceIndex]);
                    }
                } else {
                    for (
                        let destinationIndex = 0, sourceIndex = options.planeIndex;
                        destinationIndex < elementCount;
                        destinationIndex += 1, sourceIndex += this.#numberOfChannels
                    ) {
                        destinationArray[destinationIndex] = convertValue(sourceArray[sourceIndex]);
                    }
                }
            } else if (this.#format.endsWith('-planar')) {
                for (
                    let destinationIndex = 0, sourceIndex = 0;
                    destinationIndex < elementCount;
                    destinationIndex += 1,
                        sourceIndex +=
                            destinationIndex % this.#numberOfChannels === 0
                                ? 1 - this.#numberOfFrames * (this.#numberOfChannels - 1)
                                : this.#numberOfFrames
                ) {
                    destinationArray[destinationIndex] = convertValue(sourceArray[sourceIndex]);
                }
            } else {
                for (let index = 0; index < elementCount; index += 1) {
                    destinationArray[index] = convertValue(sourceArray[index]);
                }
            }
        }
    };
