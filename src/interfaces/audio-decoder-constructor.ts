import { IAudioDecoder } from './audio-decoder';
import { INativeAudioDecoderConfig } from './native-audio-decoder-config';
import { INativeAudioDecoderInit } from './native-audio-decoder-init';
import { INativeAudioDecoderSupport } from './native-audio-decoder-support';

export interface IAudioDecoderConstructor {
    new (init: INativeAudioDecoderInit): IAudioDecoder;

    isConfigSupported(config: INativeAudioDecoderConfig): Promise<INativeAudioDecoderSupport>;
}
