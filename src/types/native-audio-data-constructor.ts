import { INativeAudioData, INativeAudioDataInit } from '../interfaces';

export type TNativeAudioDataConstructor = new (init: INativeAudioDataInit) => INativeAudioData;
