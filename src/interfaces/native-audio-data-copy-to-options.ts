import { TNativeAudioSampleFormat } from '../types';

export interface INativeAudioDataCopyToOptions {
    format?: TNativeAudioSampleFormat;

    frameCount?: number;

    frameOffset?: number;

    planeIndex: number;
}
