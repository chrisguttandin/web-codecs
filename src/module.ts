import { createAudioDataConstructor } from './factories/audio-data-constructor';
import { createEncodedAudioChunkConstructor } from './factories/encoded-audio-chunk-constructor';
import { createFakeAudioDataConstructor } from './factories/fake-audio-data-constructor';
import { createFakeEncodedAudioChunkConstructor } from './factories/fake-encoded-audio-chunk-constructor';
import { createNativeAudioDataConstructor } from './factories/native-audio-data-constructor';
import { createNativeEncodedAudioChunkConstructor } from './factories/native-encoded-audio-chunk-constructor';
import { createWindow } from './factories/window';
import { computeCopyElementCount } from './functions/compute-copy-element-count';
import { convertBufferSourceToTypedArray } from './functions/convert-buffer-source-to-typed-array';
import { INativeAudioData, INativeEncodedAudioChunk } from './interfaces';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const fakeAudioDataConstructor = createFakeAudioDataConstructor(computeCopyElementCount, convertBufferSourceToTypedArray);
const window = createWindow();
const nativeAudioDataConstructor = createNativeAudioDataConstructor(window);
const nativeAudioDatas = new WeakMap<INativeAudioData, INativeAudioData>();
const audioDataConstructor = createAudioDataConstructor(fakeAudioDataConstructor, nativeAudioDataConstructor, nativeAudioDatas);

export { audioDataConstructor as AudioData };

export const nativeEncodedAudioChunks = new WeakMap<INativeEncodedAudioChunk, INativeEncodedAudioChunk>();

const fakeEncodedAudioChunkConstructor = createFakeEncodedAudioChunkConstructor(convertBufferSourceToTypedArray);
const nativeEncodedAudioChunkConstructor = createNativeEncodedAudioChunkConstructor(window);
const encodedAudioChunkConstructor = createEncodedAudioChunkConstructor(
    fakeEncodedAudioChunkConstructor,
    nativeEncodedAudioChunkConstructor,
    nativeEncodedAudioChunks
);

export { encodedAudioChunkConstructor as EncodedAudioChunk };
