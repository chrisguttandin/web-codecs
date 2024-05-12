import { INativeAudioDecoderConstructor } from '../interfaces';
import { TNativeAudioDataConstructor } from './native-audio-data-constructor';
import { TNativeEncodedAudioChunkConstructor } from './native-encoded-audio-chunk-constructor';

export type TWindow = Window &
    typeof globalThis & {
        AudioData?: TNativeAudioDataConstructor;
        AudioDecoder?: INativeAudioDecoderConstructor;
        EncodedAudioChunk?: TNativeEncodedAudioChunkConstructor;
    };
