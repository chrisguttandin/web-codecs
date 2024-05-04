import { TNativeEncodedAudioChunkType } from '../types';

export interface INativeEncodedAudioChunk {
    readonly byteLength: number;

    readonly duration: null | number;

    readonly timestamp: number;

    readonly type: TNativeEncodedAudioChunkType;

    copyTo(destination: BufferSource): void;
}
