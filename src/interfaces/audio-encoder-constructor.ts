import { IAudioEncoder } from './audio-encoder';
import { INativeAudioEncoderConfig } from './native-audio-encoder-config';
import { INativeAudioEncoderInit } from './native-audio-encoder-init';
import { INativeAudioEncoderSupport } from './native-audio-encoder-support';

export interface IAudioEncoderConstructor {
    new (init: INativeAudioEncoderInit): IAudioEncoder;

    isConfigSupported(config: INativeAudioEncoderConfig): Promise<INativeAudioEncoderSupport>;
}
