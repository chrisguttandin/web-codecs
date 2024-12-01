import { INativeAudioDecoderConstructor, INativeAudioEncoderConstructor } from '../interfaces';
import { TNativeAudioDataConstructor } from './native-audio-data-constructor';
import { TNativeEncodedAudioChunkConstructor } from './native-encoded-audio-chunk-constructor';
import { TNativeEncodedVideoChunkConstructor } from './native-encoded-video-chunk-constructor';

export type TWindow = Window &
    Omit<typeof globalThis, 'EncodedVideoChunk'> & {
        AudioData?: TNativeAudioDataConstructor;
        AudioDecoder?: INativeAudioDecoderConstructor;
        AudioEncoder?: INativeAudioEncoderConstructor;
        EncodedAudioChunk?: TNativeEncodedAudioChunkConstructor;
        EncodedVideoChunk?: TNativeEncodedVideoChunkConstructor;
    };
