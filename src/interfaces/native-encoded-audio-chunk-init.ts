import { TNativeEncodedAudioChunkType } from '../types';

export interface INativeEncodedAudioChunkInit {
    data: BufferSource;

    duration?: number;

    timestamp: number;

    type: TNativeEncodedAudioChunkType;
}
