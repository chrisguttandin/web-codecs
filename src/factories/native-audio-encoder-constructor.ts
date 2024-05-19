import { INativeAudioEncoderConstructor } from '../interfaces';
import type { createWindow } from './window';

export const createNativeAudioEncoderConstructor = (window: ReturnType<typeof createWindow>): null | INativeAudioEncoderConstructor => {
    if (window !== null && window.AudioEncoder !== undefined) {
        return window.AudioEncoder;
    }

    return null;
};
