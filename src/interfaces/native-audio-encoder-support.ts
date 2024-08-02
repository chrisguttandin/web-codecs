import { TNativeAudioEncoderConfig } from '../types';

export interface INativeAudioEncoderSupport {
    config: TNativeAudioEncoderConfig;

    supported: boolean;
}
