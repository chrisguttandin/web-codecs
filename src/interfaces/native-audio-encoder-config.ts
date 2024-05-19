import { TNativeBitrateMode } from '../types';

export interface INativeAudioEncoderConfig {
    bitrate?: number;

    bitrateMode?: TNativeBitrateMode;

    codec: string;

    numberOfChannels: number;

    sampleRate: number;
}
