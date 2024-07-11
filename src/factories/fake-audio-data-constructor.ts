import type { computeCopyElementCount as computeCopyElementCountFunction } from '../functions/compute-copy-element-count';
import type { convertBufferSourceToTypedArray as convertBufferSourceToTypedArrayFunction } from '../functions/convert-buffer-source-to-typed-array';
import { INativeAudioData, INativeAudioDataCopyToOptions, INativeAudioDataInit } from '../interfaces';
import { TNativeAudioSampleFormat } from '../types';

export const createFakeAudioDataConstructor = (
    computeCopyElementCount: typeof computeCopyElementCountFunction,
    convertBufferSourceToTypedArray: typeof convertBufferSourceToTypedArrayFunction
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

            if (format !== this.#format && format !== 'f32-planar') {
                throw new DOMException("Failed to execute 'allocationSize' on 'AudioData'.", 'NotSupportedError');
            }

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

            if (format === 'u8') {
                const destinationAsUint8Array = convertBufferSourceToTypedArray(destination, Uint8Array);

                if (this.#format === 'u8') {
                    const dataAsUint8Array = convertBufferSourceToTypedArray(this.#data, Uint8Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsUint8Array[i] = dataAsUint8Array[sourceIndex];
                    }
                } else {
                    throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'NotSupportedError');
                }
            } else if (format === 'u8-planar') {
                const destinationAsUint8Array = convertBufferSourceToTypedArray(destination, Uint8Array);

                if (this.#format === 'u8-planar') {
                    const dataAsUint8Array = convertBufferSourceToTypedArray(this.#data, Uint8Array);

                    for (let i = 0, sourceIndex = this.numberOfFrames * options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsUint8Array[i] = dataAsUint8Array[sourceIndex];
                    }
                } else {
                    throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'NotSupportedError');
                }
            } else if (format === 's16') {
                const destinationAsInt16Array = convertBufferSourceToTypedArray(destination, Int16Array);

                if (this.#format === 's16') {
                    const dataAsInt16Array = convertBufferSourceToTypedArray(this.#data, Int16Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsInt16Array[i] = dataAsInt16Array[sourceIndex];
                    }
                } else {
                    throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'NotSupportedError');
                }
            } else if (format === 's16-planar') {
                const destinationAsInt16Array = convertBufferSourceToTypedArray(destination, Int16Array);

                if (this.#format === 's16-planar') {
                    const dataAsInt16Array = convertBufferSourceToTypedArray(this.#data, Int16Array);

                    for (let i = 0, sourceIndex = this.numberOfFrames * options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsInt16Array[i] = dataAsInt16Array[sourceIndex];
                    }
                } else {
                    throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'NotSupportedError');
                }
            } else if (format === 's32') {
                const destinationAsInt32Array = convertBufferSourceToTypedArray(destination, Int32Array);

                if (this.#format === 's32') {
                    const dataAsInt32Array = convertBufferSourceToTypedArray(this.#data, Int32Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsInt32Array[i] = dataAsInt32Array[sourceIndex];
                    }
                } else {
                    throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'NotSupportedError');
                }
            } else if (format === 's32-planar') {
                const destinationAsInt32Array = convertBufferSourceToTypedArray(destination, Int32Array);

                if (this.#format === 's32-planar') {
                    const dataAsInt32Array = convertBufferSourceToTypedArray(this.#data, Int32Array);

                    for (let i = 0, sourceIndex = this.numberOfFrames * options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsInt32Array[i] = dataAsInt32Array[sourceIndex];
                    }
                } else {
                    throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'NotSupportedError');
                }
            } else if (format === 'f32') {
                const destinationAsFloat32Array = convertBufferSourceToTypedArray(destination, Float32Array);

                if (this.#format === 'f32') {
                    const dataAsFloat32Array = convertBufferSourceToTypedArray(this.#data, Float32Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsFloat32Array[i] = dataAsFloat32Array[sourceIndex];
                    }
                } else {
                    throw new DOMException("Failed to execute 'copyTo' on 'AudioData'.", 'NotSupportedError');
                }
            } else if (format === 'f32-planar') {
                const destinationAsFloat32Array = convertBufferSourceToTypedArray(destination, Float32Array);

                if (this.#format === 'u8') {
                    const dataAsUint8Array = convertBufferSourceToTypedArray(this.#data, Uint8Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += this.#numberOfChannels) {
                        const value = dataAsUint8Array[sourceIndex];

                        destinationAsFloat32Array[i] = (value - 128) * Math.fround(1 / (value < 128 ? 128 : 127));
                    }
                } else if (this.#format === 'u8-planar') {
                    const dataAsUint8Array = convertBufferSourceToTypedArray(this.#data, Uint8Array);

                    for (let i = 0, sourceIndex = this.numberOfFrames * options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        const value = dataAsUint8Array[sourceIndex];

                        destinationAsFloat32Array[i] = (value - 128) * Math.fround(1 / (value < 128 ? 128 : 127));
                    }
                } else if (this.#format === 's16') {
                    const dataAsInt16Array = convertBufferSourceToTypedArray(this.#data, Int16Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += this.#numberOfChannels) {
                        const value = dataAsInt16Array[sourceIndex];

                        destinationAsFloat32Array[i] = value * Math.fround(1 / (value < 0 ? 32768 : 32767));
                    }
                } else if (this.#format === 's16-planar') {
                    const dataAsInt16Array = convertBufferSourceToTypedArray(this.#data, Int16Array);

                    for (let i = 0, sourceIndex = this.numberOfFrames * options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        const value = dataAsInt16Array[sourceIndex];

                        destinationAsFloat32Array[i] = value * Math.fround(1 / (value < 0 ? 32768 : 32767));
                    }
                } else if (this.#format === 's32') {
                    const dataAsInt32Array = convertBufferSourceToTypedArray(this.#data, Int32Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += this.#numberOfChannels) {
                        const value = dataAsInt32Array[sourceIndex];

                        destinationAsFloat32Array[i] = value * Math.fround(1 / (value < 0 ? 2147483648 : 2147483647));
                    }
                } else if (this.#format === 's32-planar') {
                    const dataAsInt32Array = convertBufferSourceToTypedArray(this.#data, Int32Array);

                    for (let i = 0, sourceIndex = this.numberOfFrames * options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        const value = dataAsInt32Array[sourceIndex];

                        destinationAsFloat32Array[i] = value * Math.fround(1 / (value < 0 ? 2147483648 : 2147483647));
                    }
                } else if (this.#format === 'f32') {
                    const dataAsFloat32Array = convertBufferSourceToTypedArray(this.#data, Float32Array);

                    for (let i = 0, sourceIndex = options.planeIndex; i < elementCount; i += 1, sourceIndex += this.#numberOfChannels) {
                        destinationAsFloat32Array[i] = dataAsFloat32Array[sourceIndex];
                    }
                } else if (this.#format === 'f32-planar') {
                    const dataAsFloat32Array = convertBufferSourceToTypedArray(this.#data, Float32Array);

                    for (let i = 0, sourceIndex = this.numberOfFrames * options.planeIndex; i < elementCount; i += 1, sourceIndex += 1) {
                        destinationAsFloat32Array[i] = dataAsFloat32Array[sourceIndex];
                    }
                }
            }
        }
    };
