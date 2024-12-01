import { TNativeEncodedVideoChunkConstructor } from '../types';
import type { createWindow } from './window';

export const createNativeEncodedVideoChunkConstructor = (
    window: ReturnType<typeof createWindow>
): null | TNativeEncodedVideoChunkConstructor => {
    if (window !== null && window.EncodedVideoChunk !== undefined) {
        return window.EncodedVideoChunk;
    }

    return null;
};
