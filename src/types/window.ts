import { TNativeAudioDataConstructor } from './native-audio-data-constructor';
import { TNativeEncodedAudioChunkConstructor } from './native-encoded-audio-chunk-constructor';

export type TWindow = Window &
    typeof globalThis & {
        AudioData?: TNativeAudioDataConstructor;
        EncodedAudioChunk?: TNativeEncodedAudioChunkConstructor;
    };
