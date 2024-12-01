import { TNativeEncodedVideoChunkType } from '../types';

export interface INativeEncodedVideoChunk {
    readonly byteLength: number;

    readonly duration: null | number;

    readonly timestamp: number;

    readonly type: TNativeEncodedVideoChunkType;

    copyTo(destination: BufferSource): void;
}
