import { TNativeAudioDataConstructor } from './native-audio-data-constructor';

export type TWindow = Window &
    typeof globalThis & {
        AudioData?: TNativeAudioDataConstructor;
    };
