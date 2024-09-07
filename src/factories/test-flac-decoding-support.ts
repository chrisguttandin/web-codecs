import type { createNativeAudioDecoderConstructor } from './native-audio-decoder-constructor';

const FLAC_DESCRIPTION = new Uint8Array([
    102, 76, 97, 67, 0, 0, 0, 34, 18, 0, 18, 0, 0, 0, 186, 0, 5, 57, 11, 184, 0, 240, 0, 3, 169, 128, 148, 172, 171, 223, 193, 198, 120,
    195, 117, 49, 236, 130, 87, 47, 118, 114
]);

// Bug #19: Firefox v131 is not supporting FLAC.
export const createTestFlacDecodingSupport =
    (nativeAudioDecoderConstructor: ReturnType<typeof createNativeAudioDecoderConstructor>) => async () => {
        if (nativeAudioDecoderConstructor === null) {
            return false;
        }

        const audioDecoder = new nativeAudioDecoderConstructor({
            // tslint:disable-next-line:no-empty
            error: () => {},
            // tslint:disable-next-line:no-empty
            output: () => {}
        });

        audioDecoder.configure({
            codec: 'flac',
            description: FLAC_DESCRIPTION,
            numberOfChannels: 1,
            sampleRate: 48000
        });

        try {
            await audioDecoder.flush();

            audioDecoder.close();
        } catch {
            return false;
        }

        return true;
    };
