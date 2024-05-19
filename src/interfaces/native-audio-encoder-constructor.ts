import { INativeAudioEncoder } from './native-audio-encoder';
import { INativeAudioEncoderConfig } from './native-audio-encoder-config';
import { INativeAudioEncoderInit } from './native-audio-encoder-init';
import { INativeAudioEncoderSupport } from './native-audio-encoder-support';

export interface INativeAudioEncoderConstructor {
    new (init: INativeAudioEncoderInit): INativeAudioEncoder;

    isConfigSupported(config: INativeAudioEncoderConfig): Promise<INativeAudioEncoderSupport>;
}
