import { TEventHandler, TNativeCodecState } from '../types';
import { IAudioDecoderEventMap } from './audio-decoder-event-map';
import { IEventTarget } from './event-target';
import { INativeAudioDecoderConfig } from './native-audio-decoder-config';
import { INativeEncodedAudioChunk } from './native-encoded-audio-chunk';

export interface IAudioDecoder extends IEventTarget<IAudioDecoderEventMap> {
    readonly decodeQueueSize: number;

    ondequeue: null | TEventHandler<this>;

    readonly state: TNativeCodecState;

    close(): void;

    configure(config: INativeAudioDecoderConfig): void;

    decode(chunk: INativeEncodedAudioChunk): void;

    flush(): Promise<void>;

    reset(): void;
}
