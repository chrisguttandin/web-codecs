import { INativeEncodedAudioChunk, INativeEncodedAudioChunkInit } from '../interfaces';
import { TNativeEncodedAudioChunkType } from '../types';
import type { createFakeEncodedAudioChunkConstructor } from './fake-encoded-audio-chunk-constructor';
import type { createNativeEncodedAudioChunkConstructor } from './native-encoded-audio-chunk-constructor';

export const createEncodedAudioChunkConstructor = (
    fakeEncodedAudioChunkConstructor: ReturnType<typeof createFakeEncodedAudioChunkConstructor>,
    nativeEncodedAudioChunkConstructor: ReturnType<typeof createNativeEncodedAudioChunkConstructor>,
    nativeEncodedAudioChunks: WeakMap<INativeEncodedAudioChunk, INativeEncodedAudioChunk>
) => {
    return class EncodedAudioChunk implements INativeEncodedAudioChunk {
        // tslint:disable-next-line:member-access
        #internalEncodedAudioChunk: INativeEncodedAudioChunk;

        constructor(init: INativeEncodedAudioChunkInit) {
            this.#internalEncodedAudioChunk =
                nativeEncodedAudioChunkConstructor === null
                    ? new fakeEncodedAudioChunkConstructor(init)
                    : new nativeEncodedAudioChunkConstructor(init);

            if (nativeEncodedAudioChunkConstructor !== null) {
                nativeEncodedAudioChunks.set(this, this.#internalEncodedAudioChunk);
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
    };
};
