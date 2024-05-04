import { INativeEncodedAudioChunk, INativeEncodedAudioChunkInit } from '../interfaces';

export type TNativeEncodedAudioChunkConstructor = new (init: INativeEncodedAudioChunkInit) => INativeEncodedAudioChunk;
