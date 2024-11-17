import { INativeEncodedAudioChunk, INativeEncodedAudioChunkMetadata } from '../interfaces';

export type TNativeEncodedAudioChunkOutputCallback = (output: INativeEncodedAudioChunk, metadata: INativeEncodedAudioChunkMetadata) => void;
