import { TNativeAudioSampleFormat } from '../types';
import { INativeAudioDataCopyToOptions } from './native-audio-data-copy-to-options';

export interface INativeAudioData {
    readonly duration: number;

    readonly format: null | TNativeAudioSampleFormat;

    readonly numberOfChannels: number;

    readonly numberOfFrames: number;

    readonly sampleRate: number;

    readonly timestamp: number;

    allocationSize(options: INativeAudioDataCopyToOptions): number;

    clone(): INativeAudioData;

    close(): void;

    copyTo(destination: BufferSource, options: INativeAudioDataCopyToOptions): void;
}
