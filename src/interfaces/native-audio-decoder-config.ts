export interface INativeAudioDecoderConfig {
    codec: string;

    description?: BufferSource;

    numberOfChannels: number;

    sampleRate: number;
}
