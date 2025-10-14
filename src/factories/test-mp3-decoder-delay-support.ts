import type { createNativeAudioDecoderConstructor } from './native-audio-decoder-constructor';
import type { createNativeEncodedAudioChunkConstructor } from './native-encoded-audio-chunk-constructor';

export const createTestMp3DecoderDelaySupport =
    (
        nativeAudioDecoderConstructor: ReturnType<typeof createNativeAudioDecoderConstructor>,
        nativeEncodedAudioChunkConstructor: ReturnType<typeof createNativeEncodedAudioChunkConstructor>
    ) =>
    async () => {
        if (nativeAudioDecoderConstructor === null || nativeEncodedAudioChunkConstructor === null) {
            return false;
        }

        let numberOfAudioDatas = 0;

        const audioDecoder = new nativeAudioDecoderConstructor({
            // tslint:disable-next-line no-empty
            error: () => {},
            output: () => {
                numberOfAudioDatas += 1;
            }
        });

        audioDecoder.configure({
            codec: 'mp3',
            numberOfChannels: 1,
            sampleRate: 48000
        });
        audioDecoder.decode(
            new nativeEncodedAudioChunkConstructor({
                data: new Uint8Array([
                    255, 251, 116, 196, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
                ]),
                duration: 96000,
                timestamp: 0,
                type: 'key'
            })
        );

        await audioDecoder.flush();

        audioDecoder.close();

        return numberOfAudioDatas === 2;
    };
