import type { detachArrayBuffer as detachArrayBufferFunction } from '../functions/detach-array-buffer';
import { INativeEncodedVideoChunk, INativeEncodedVideoChunkInit } from '../interfaces';
import { TNativeEncodedVideoChunkType } from '../types';
import type { createNativeEncodedVideoChunkConstructor } from './native-encoded-video-chunk-constructor';

export const createEncodedVideoChunkConstructor = (
    detachArrayBuffer: typeof detachArrayBufferFunction,
    nativeEncodedVideoChunkConstructor: ReturnType<typeof createNativeEncodedVideoChunkConstructor>,
    nativeEncodedVideoChunks: WeakMap<INativeEncodedVideoChunk, INativeEncodedVideoChunk>
) => {
    return class EncodedVideoChunk implements INativeEncodedVideoChunk {
        // tslint:disable-next-line:member-access
        #internalEncodedVideoChunk: INativeEncodedVideoChunk;

        constructor(init: INativeEncodedVideoChunkInit) {
            const { byteLength } = init.data;

            if (nativeEncodedVideoChunkConstructor === null) {
                throw new Error('Missing the native EncodedVideoChunk constructor.');
            }

            this.#internalEncodedVideoChunk = new nativeEncodedVideoChunkConstructor(init);

            // Bug #24: Safari allows to create an EncodedVideoChunk without a timestamp.
            if (init.timestamp === undefined) {
                throw new TypeError("Failed to construct 'EncodedVideoChunk'.");
            }

            if (init.transfer !== undefined) {
                // Bug #16: Firefox and Safari ignore multiple references to the same ArrayBuffer.
                if (init.transfer.length !== new Set(init.transfer).size) {
                    throw new DOMException("Failed to construct 'EncodedVideoChunk'.", 'DataCloneError');
                }

                const arrayBuffer = init.data instanceof ArrayBuffer ? init.data : init.data.buffer;

                if (init.transfer.includes(arrayBuffer)) {
                    // Bug #17: Firefox and Safari ignore an already detached ArrayBuffer.
                    if (byteLength === 0) {
                        throw new DOMException("Failed to construct 'EncodedVideoChunk'.", 'DataCloneError');
                    }

                    // Bug #18: Firefox and Safari do not detach the ArrayBuffer.
                    if (init.data.byteLength > 0) {
                        detachArrayBuffer(arrayBuffer);
                    }
                }
            }

            nativeEncodedVideoChunks.set(this, this.#internalEncodedVideoChunk);

            /*
             * This violates all good pratices but it is necessary to allow this EncodedVideoChunk to be used with the native
             * implementation.
             */
            return <EncodedVideoChunk>this.#internalEncodedVideoChunk;
        }

        public get byteLength(): number {
            return this.#internalEncodedVideoChunk.byteLength;
        }

        public get duration(): null | number {
            return this.#internalEncodedVideoChunk.duration;
        }

        public get timestamp(): number {
            return this.#internalEncodedVideoChunk.timestamp;
        }

        public get type(): TNativeEncodedVideoChunkType {
            return this.#internalEncodedVideoChunk.type;
        }

        public copyTo(destination: BufferSource): void {
            return this.#internalEncodedVideoChunk.copyTo(destination);
        }

        public static [Symbol.hasInstance](instance: unknown): boolean {
            return (
                instance !== null &&
                typeof instance === 'object' &&
                (Object.getPrototypeOf(instance) === EncodedVideoChunk.prototype ||
                    (nativeEncodedVideoChunkConstructor !== null &&
                        Object.getPrototypeOf(instance) === nativeEncodedVideoChunkConstructor.prototype))
            );
        }
    };
};
