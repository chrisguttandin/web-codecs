import { TEventHandler, TNativeCodecState } from '../types';
import { INativeAudioData } from './native-audio-data';
import { INativeAudioEncoderConfig } from './native-audio-encoder-config';

export interface INativeAudioEncoder extends EventTarget {
    readonly encodeQueueSize: number;

    ondequeue: null | TEventHandler<this>;

    readonly state: TNativeCodecState;

    close(): void;

    configure(config: INativeAudioEncoderConfig): void;

    encode(data: INativeAudioData): void;

    flush(): Promise<undefined>;

    reset(): void;
}
