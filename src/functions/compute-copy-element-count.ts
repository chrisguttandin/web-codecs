import { TNativeAudioSampleFormat } from '../types';

export const computeCopyElementCount = (
    format: TNativeAudioSampleFormat,
    frameCount: number,
    frameOffset: number,
    numberOfChannels: number,
    numberOfFrames: number,
    planeIndex: number
) => {
    const isPlanar = format.endsWith('-planar');

    if (
        (planeIndex > 0 && !isPlanar) ||
        (planeIndex >= numberOfChannels && isPlanar) ||
        frameOffset >= numberOfFrames ||
        frameCount > numberOfFrames - frameOffset
    ) {
        throw new RangeError("Failed to execute 'computeCopyElementCount'.");
    }

    if (isPlanar) {
        return frameCount;
    }

    return frameCount * numberOfChannels;
};
