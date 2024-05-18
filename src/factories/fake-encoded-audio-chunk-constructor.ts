import type { convertBufferSourceToTypedArray as convertBufferSourceToTypedArrayFunction } from '../functions/convert-buffer-source-to-typed-array';
import { INativeEncodedAudioChunk, INativeEncodedAudioChunkInit } from '../interfaces';
import { TNativeEncodedAudioChunkType } from '../types';

export const createFakeEncodedAudioChunkConstructor = (
    convertBufferSourceToTypedArray: ReturnType<typeof convertBufferSourceToTypedArrayFunction>
) =>
    class FakeEncodedAudioChunk implements INativeEncodedAudioChunk {
        // tslint:disable-next-line:member-access
        #data: BufferSource;

        // tslint:disable-next-line:member-access
        #duration: null | number;

        // tslint:disable-next-line:member-access
        #timestamp: number;

        // tslint:disable-next-line:member-access
        #type: TNativeEncodedAudioChunkType;

        constructor(init: INativeEncodedAudioChunkInit) {
            if (init.data === undefined || init.timestamp === undefined || init.type === undefined) {
                throw new TypeError("Failed to construct 'EncodedAudioChunk'.");
            }

            if (init.transfer !== undefined) {
                if (init.transfer.length !== new Set(init.transfer).size) {
                    throw new DOMException("Failed to construct 'EncodedAudioChunk'.", 'DataCloneError');
                }

                for (const arrayBuffer of init.transfer) {
                    const { port1 } = new MessageChannel();

                    port1.postMessage(arrayBuffer, [arrayBuffer]);
                    port1.close();
                }
            }

            this.#data = init.data;
            this.#duration = init.duration ?? null;
            this.#timestamp = init.timestamp;
            this.#type = init.type;
        }

        public get byteLength(): number {
            return this.#data.byteLength;
        }

        public get duration(): null | number {
            return this.#duration ?? null;
        }

        public get timestamp(): number {
            return this.#timestamp;
        }

        public get type(): TNativeEncodedAudioChunkType {
            return this.#type;
        }

        public copyTo(destination: BufferSource): void {
            const destinationAsUint8Array = convertBufferSourceToTypedArray(destination, Uint8Array);
            const dataAsUint8Array = convertBufferSourceToTypedArray(this.#data, Uint8Array);

            if (destinationAsUint8Array.byteLength < dataAsUint8Array.byteLength) {
                throw new TypeError("Failed to execute 'copyTo' on 'FakeEncodedAudioChunk'.");
            }

            destinationAsUint8Array.set(dataAsUint8Array);
        }
    };
