import { createAudioDataConstructor } from './factories/audio-data-constructor';
import { createFakeAudioDataConstructor } from './factories/fake-audio-data-constructor';
import { createNativeAudioDataConstructor } from './factories/native-audio-data-constructor';
import { createWindow } from './factories/window';
import { computeCopyElementCount } from './functions/compute-copy-element-count';
import { convertBufferSourceToTypedArray } from './functions/convert-buffer-source-to-typed-array';
import { INativeAudioData } from './interfaces';

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
