import type { detachArrayBuffer as detachArrayBufferFunction } from '../functions/detach-array-buffer';
import { INativeEncodedAudioChunk, INativeEncodedAudioChunkInit } from '../interfaces';
import { TNativeEncodedAudioChunkType } from '../types';
import type { createFakeEncodedAudioChunkConstructor } from './fake-encoded-audio-chunk-constructor';
import type { createNativeEncodedAudioChunkConstructor } from './native-encoded-audio-chunk-constructor';

export const createEncodedAudioChunkConstructor = (
    detachArrayBuffer: typeof detachArrayBufferFunction,
    fakeEncodedAudioChunkConstructor: ReturnType<typeof createFakeEncodedAudioChunkConstructor>,
    nativeEncodedAudioChunkConstructor: ReturnType<typeof createNativeEncodedAudioChunkConstructor>,
    nativeEncodedAudioChunks: WeakMap<INativeEncodedAudioChunk, INativeEncodedAudioChunk>
) => {
    return class EncodedAudioChunk implements INativeEncodedAudioChunk {
        // tslint:disable-next-line:member-access
        #internalEncodedAudioChunk: INativeEncodedAudioChunk;

        constructor(init: INativeEncodedAudioChunkInit) {
            const { byteLength } = init.data;

            // Bug #4: EncodedAudioChunk is not yet implemented in Firefox and Safari.
            this.#internalEncodedAudioChunk =
                nativeEncodedAudioChunkConstructor === null
                    ? new fakeEncodedAudioChunkConstructor(init)
                    : new nativeEncodedAudioChunkConstructor(init);

            if (init.transfer !== undefined) {
                // Bug 16: Firefox is ignoring multiple references to the same ArrayBuffer.
                if (init.transfer.length !== new Set(init.transfer).size) {
                    throw new DOMException("Failed to construct 'EncodedAudioChunk'.", 'DataCloneError');
                }

                const arrayBuffer = init.data instanceof ArrayBuffer ? init.data : init.data.buffer;

                if (init.transfer.includes(arrayBuffer)) {
                    // Bug #17: Firefox ignores an already detached ArrayBuffer.
                    if (byteLength === 0) {
                        throw new DOMException("Failed to construct 'EncodedAudioChunk'.", 'DataCloneError');
                    }

                    // Bug #18: Firefox does not detach the ArrayBuffer.
                    if (init.data.byteLength > 0) {
                        detachArrayBuffer(arrayBuffer);
                    }
                }
            }

            if (nativeEncodedAudioChunkConstructor !== null) {
                nativeEncodedAudioChunks.set(this, this.#internalEncodedAudioChunk);

                /*
                 * This violates all good pratices but it is necessary to allow this EncodedAudioChunk to be used with the native
                 * implementation.
                 */
                return <EncodedAudioChunk>this.#internalEncodedAudioChunk;
            }
        }

        public get byteLength(): number {
            return this.#internalEncodedAudioChunk.byteLength;
        }

        public get duration(): null | number {
            return this.#internalEncodedAudioChunk.duration;
        }

        public get timestamp(): number {
            return this.#internalEncodedAudioChunk.timestamp;
        }

        public get type(): TNativeEncodedAudioChunkType {
            return this.#internalEncodedAudioChunk.type;
        }

        public copyTo(destination: BufferSource): void {
            return this.#internalEncodedAudioChunk.copyTo(destination);
        }

        public static [Symbol.hasInstance](instance: unknown): boolean {
            return (
                instance !== null &&
                typeof instance === 'object' &&
                (Object.getPrototypeOf(instance) === EncodedAudioChunk.prototype ||
                    (nativeEncodedAudioChunkConstructor !== null &&
                        Object.getPrototypeOf(instance) === nativeEncodedAudioChunkConstructor.prototype))
            );
        }
    };
};
