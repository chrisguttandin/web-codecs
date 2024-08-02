import { TEventHandler, TNativeAudioEncoderConfig, TNativeCodecState } from '../types';
import { IAudioEncoderEventMap } from './audio-encoder-event-map';
import { IEventTarget } from './event-target';
import { INativeAudioData } from './native-audio-data';

export interface IAudioEncoder extends IEventTarget<IAudioEncoderEventMap> {
    readonly encodeQueueSize: number;

    ondequeue: null | TEventHandler<this>;

    readonly state: TNativeCodecState;

    close(): void;

    configure(config: TNativeAudioEncoderConfig): void;

    encode(data: INativeAudioData): void;

    flush(): Promise<void>;

    reset(): void;
}
