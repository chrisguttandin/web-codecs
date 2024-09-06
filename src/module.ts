import { KNOWN_AUDIO_CODECS } from './constants/known-audio-codecs';
import { createAudioDataConstructor } from './factories/audio-data-constructor';
import { createAudioDecoderConstructor } from './factories/audio-decoder-constructor';
import { createAudioEncoderConstructor } from './factories/audio-encoder-constructor';
import { createEncodedAudioChunkConstructor } from './factories/encoded-audio-chunk-constructor';
import { createFakeAudioDataConstructor } from './factories/fake-audio-data-constructor';
import { createFakeAudioDecoderConstructor } from './factories/fake-audio-decoder-constructor';
import { createFakeAudioEncoderConstructor } from './factories/fake-audio-encoder-constructor';
import { createFakeEncodedAudioChunkConstructor } from './factories/fake-encoded-audio-chunk-constructor';
import { createIsKnownAudioCodec } from './factories/is-known-codec';
import { createNativeAudioDataConstructor } from './factories/native-audio-data-constructor';
import { createNativeAudioDecoderConstructor } from './factories/native-audio-decoder-constructor';
import { createNativeAudioEncoderConstructor } from './factories/native-audio-encoder-constructor';
import { createNativeEncodedAudioChunkConstructor } from './factories/native-encoded-audio-chunk-constructor';
import { createWindow } from './factories/window';
import { computeCopyElementCount } from './functions/compute-copy-element-count';
import { convertBufferSourceToTypedArray } from './functions/convert-buffer-source-to-typed-array';
import { convertFloat32ToInt16 } from './functions/convert-float32-to-int16';
import { convertFloat32ToInt32 } from './functions/convert-float32-to-int32';
import { convertFloat32ToUint8 } from './functions/convert-float32-to-uint8';
import { convertInt16ToFloat32 } from './functions/convert-int16-to-float32';
import { convertInt16ToInt32 } from './functions/convert-int16-to-int32';
import { convertInt16ToUint8 } from './functions/convert-int16-to-uint8';
import { convertInt32ToFloat32 } from './functions/convert-int32-to-float32';
import { convertInt32ToInt16 } from './functions/convert-int32-to-int16';
import { convertInt32ToUint8 } from './functions/convert-int32-to-uint8';
import { convertUint8ToFloat32 } from './functions/convert-uint8-to-float32';
import { convertUint8ToInt16 } from './functions/convert-uint8-to-int16';
import { convertUint8ToInt32 } from './functions/convert-uint8-to-int32';
import { detachArrayBuffer } from './functions/detach-array-buffer';
import { filterEntries } from './functions/filter-entries';
import { INativeAudioData, INativeEncodedAudioChunk } from './interfaces';

/*
 * @todo Explicitly referencing the barrel file seems to be necessary when enabling the
 * isolatedModules compiler option.
 */
export * from './interfaces/index';
export * from './types/index';

const fakeAudioDataConstructor = createFakeAudioDataConstructor(
    computeCopyElementCount,
    convertBufferSourceToTypedArray,
    convertFloat32ToInt16,
    convertFloat32ToInt32,
    convertFloat32ToUint8,
    convertInt16ToFloat32,
    convertInt16ToInt32,
    convertInt16ToUint8,
    convertInt32ToFloat32,
    convertInt32ToInt16,
    convertInt32ToUint8,
    convertUint8ToFloat32,
    convertUint8ToInt16,
    convertUint8ToInt32,
    detachArrayBuffer
);
const window = createWindow();
const nativeAudioDataConstructor = createNativeAudioDataConstructor(window);
const nativeAudioDatas = new WeakMap<INativeAudioData, INativeAudioData>();
const audioDataConstructor = createAudioDataConstructor(fakeAudioDataConstructor, nativeAudioDataConstructor, nativeAudioDatas);

export { audioDataConstructor as AudioData };

const isKnownAudioCodec = createIsKnownAudioCodec(KNOWN_AUDIO_CODECS);
const fakeAudioDecoderConstructor = createFakeAudioDecoderConstructor(filterEntries, isKnownAudioCodec);
const nativeAudioDecoderConstructor = createNativeAudioDecoderConstructor(window);
const nativeEncodedAudioChunks = new WeakMap<INativeEncodedAudioChunk, INativeEncodedAudioChunk>();
const audioDecoderConstructor = createAudioDecoderConstructor(
    fakeAudioDecoderConstructor,
    nativeAudioDecoderConstructor,
    nativeEncodedAudioChunks
);

export { audioDecoderConstructor as AudioDecoder };

const fakeAudioEncoderConstructor = createFakeAudioEncoderConstructor(filterEntries, isKnownAudioCodec);
const nativeAudioEncoderConstructor = createNativeAudioEncoderConstructor(window);
const audioEncoderConstructor = createAudioEncoderConstructor(fakeAudioEncoderConstructor, nativeAudioDatas, nativeAudioEncoderConstructor);

export { audioEncoderConstructor as AudioEncoder };

const fakeEncodedAudioChunkConstructor = createFakeEncodedAudioChunkConstructor(convertBufferSourceToTypedArray, detachArrayBuffer);
const nativeEncodedAudioChunkConstructor = createNativeEncodedAudioChunkConstructor(window);
const encodedAudioChunkConstructor = createEncodedAudioChunkConstructor(
    fakeEncodedAudioChunkConstructor,
    nativeEncodedAudioChunkConstructor,
    nativeEncodedAudioChunks
);

export { encodedAudioChunkConstructor as EncodedAudioChunk };
