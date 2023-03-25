import type { createWindow } from './window';

export const createNativeAudioDataConstructor = (window: ReturnType<typeof createWindow>) => {
    if (window !== null && window.AudioData !== undefined) {
        return window.AudioData;
    }

    return null;
};
