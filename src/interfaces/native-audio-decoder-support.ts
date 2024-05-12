import { INativeAudioDecoderConfig } from './native-audio-decoder-config';

export interface INativeAudioDecoderSupport {
    config: INativeAudioDecoderConfig;

    supported: boolean;
}
