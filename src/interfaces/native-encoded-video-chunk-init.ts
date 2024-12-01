import { TNativeEncodedVideoChunkType } from '../types';

export interface INativeEncodedVideoChunkInit {
    data: BufferSource;

    duration?: number;

    timestamp: number;

    transfer?: ArrayBuffer[];

    type: TNativeEncodedVideoChunkType;
}
