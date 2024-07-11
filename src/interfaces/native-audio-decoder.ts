import { TEventHandler, TNativeCodecState } from '../types';
import { INativeAudioDecoderConfig } from './native-audio-decoder-config';
import { INativeEncodedAudioChunk } from './native-encoded-audio-chunk';

export interface INativeAudioDecoder extends EventTarget {
    readonly decodeQueueSize: number;

    ondequeue: null | TEventHandler<this>;

    readonly state: TNativeCodecState;

    close(): void;

    configure(config: INativeAudioDecoderConfig): void;

    decode(chunk: INativeEncodedAudioChunk): void;

    flush(): Promise<void>;

    reset(): void;
}
