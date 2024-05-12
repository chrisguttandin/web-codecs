import { TNativeAudioDataOutputCallback, TNativeWebCodecsErrorCallback } from '../types';

export interface INativeAudioDecoderInit {
    error: TNativeWebCodecsErrorCallback;

    output: TNativeAudioDataOutputCallback;
}
