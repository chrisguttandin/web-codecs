import { TNativeAudioSampleFormat } from '../types';

export interface INativeAudioDataInit {
    data: BufferSource;

    format: TNativeAudioSampleFormat;

    numberOfChannels: number;

    numberOfFrames: number;

    sampleRate: number;

    timestamp: number;

    transfer?: ArrayBuffer[];
}
