import { INativeAudioDecoder } from './native-audio-decoder';
import { INativeAudioDecoderConfig } from './native-audio-decoder-config';
import { INativeAudioDecoderInit } from './native-audio-decoder-init';
import { INativeAudioDecoderSupport } from './native-audio-decoder-support';

export interface INativeAudioDecoderConstructor {
    new (init: INativeAudioDecoderInit): INativeAudioDecoder;

    isConfigSupported(config: INativeAudioDecoderConfig): Promise<INativeAudioDecoderSupport>;
}
