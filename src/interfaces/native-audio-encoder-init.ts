import { TNativeEncodedAudioChunkOutputCallback, TNativeWebCodecsErrorCallback } from '../types';

export interface INativeAudioEncoderInit {
    error: TNativeWebCodecsErrorCallback;

    output: TNativeEncodedAudioChunkOutputCallback;
}
