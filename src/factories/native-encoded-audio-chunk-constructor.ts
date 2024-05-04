import { TNativeEncodedAudioChunkConstructor } from '../types';
import type { createWindow } from './window';

export const createNativeEncodedAudioChunkConstructor = (
    window: ReturnType<typeof createWindow>
): null | TNativeEncodedAudioChunkConstructor => {
    if (window !== null && window.EncodedAudioChunk !== undefined) {
        return window.EncodedAudioChunk;
    }

    return null;
};
