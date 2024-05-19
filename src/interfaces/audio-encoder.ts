import { TEventHandler, TNativeCodecState } from '../types';
import { IAudioEncoderEventMap } from './audio-encoder-event-map';
import { IEventTarget } from './event-target';
import { INativeAudioData } from './native-audio-data';
import { INativeAudioEncoderConfig } from './native-audio-encoder-config';

export interface IAudioEncoder extends IEventTarget<IAudioEncoderEventMap> {
    readonly encodeQueueSize: number;

    ondequeue: null | TEventHandler<this>;

    readonly state: TNativeCodecState;

    close(): void;

    configure(config: INativeAudioEncoderConfig): void;

    encode(data: INativeAudioData): void;

    flush(): Promise<undefined>;

    reset(): void;
}
