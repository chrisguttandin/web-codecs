import { TNativeAudioEncoderConfig } from '../types';
import { INativeAudioEncoder } from './native-audio-encoder';
import { INativeAudioEncoderInit } from './native-audio-encoder-init';
import { INativeAudioEncoderSupport } from './native-audio-encoder-support';

export interface INativeAudioEncoderConstructor {
    new (init: INativeAudioEncoderInit): INativeAudioEncoder;

    isConfigSupported(config: TNativeAudioEncoderConfig): Promise<INativeAudioEncoderSupport>;
}
