import { INativeAudioDecoderConstructor } from '../interfaces';
import type { createWindow } from './window';

export const createNativeAudioDecoderConstructor = (window: ReturnType<typeof createWindow>): null | INativeAudioDecoderConstructor => {
    if (window !== null && window.AudioDecoder !== undefined) {
        return window.AudioDecoder;
    }

    return null;
};
