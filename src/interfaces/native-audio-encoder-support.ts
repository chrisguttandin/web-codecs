import { INativeAudioEncoderConfig } from './native-audio-encoder-config';

export interface INativeAudioEncoderSupport {
    config: INativeAudioEncoderConfig;

    supported: boolean;
}
