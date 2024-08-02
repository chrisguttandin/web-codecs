import { TNativeAudioEncoderConfig } from '../types';
import { IAudioEncoder } from './audio-encoder';
import { INativeAudioEncoderInit } from './native-audio-encoder-init';
import { INativeAudioEncoderSupport } from './native-audio-encoder-support';

export interface IAudioEncoderConstructor {
    new (init: INativeAudioEncoderInit): IAudioEncoder;

    isConfigSupported(config: TNativeAudioEncoderConfig): Promise<INativeAudioEncoderSupport>;
}
