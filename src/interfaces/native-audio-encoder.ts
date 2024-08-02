import { TEventHandler, TNativeAudioEncoderConfig, TNativeCodecState } from '../types';
import { INativeAudioData } from './native-audio-data';

export interface INativeAudioEncoder extends EventTarget {
    readonly encodeQueueSize: number;

    ondequeue: null | TEventHandler<this>;

    readonly state: TNativeCodecState;

    close(): void;

    configure(config: TNativeAudioEncoderConfig): void;

    encode(data: INativeAudioData): void;

    flush(): Promise<void>;

    reset(): void;
}
