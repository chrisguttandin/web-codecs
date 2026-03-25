import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VORBIS_DESCRIPTION } from '../../../helpers/vorbis-description';
import { loadFixtureAsArrayBuffer } from '../../../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../../../helpers/load-fixture-as-json';

describe('AudioDecoder', () => {
    describe('with an mp4 file', () => {
        // bug #11

        let encodedArrayBuffer;
        let json;
        let output;

        beforeEach(async () => {
            [encodedArrayBuffer, json] = await Promise.all([
                loadFixtureAsArrayBuffer(`sine-mp4a-40-2.mp4`),
                loadFixtureAsJson(`sine-mp4a-40-2.mp4.json`)
            ]);

            output = vi.fn();
        });

        it('should emit multiple instances of the AudioData constructor with a wrong timestamp', async () => {
            // eslint-disable-next-line no-undef
            const audioDecoder = new AudioDecoder({
                error: () => {
                    throw new Error('This should never be called.');
                },
                output
            });

            audioDecoder.configure({
                ...json.config,
                description: encodedArrayBuffer.slice(...json.config.description)
            });
            json.encodedAudioChunks.reduce((timestamp, { data, duration }) => {
                audioDecoder.decode(
                    // eslint-disable-next-line no-undef
                    new EncodedAudioChunk({
                        data: encodedArrayBuffer.slice(...data),
                        duration,
                        timestamp,
                        type: 'key'
                    })
                );

                return timestamp + duration;
            }, 0);

            await audioDecoder.flush();

            output.mock.calls.reduce((numberOfFrames, [audioData]) => {
                const timestamp = Math.floor((numberOfFrames * 1000000) / audioData.sampleRate);

                if (timestamp <= 42666) {
                    expect(audioData.timestamp).to.equal(timestamp);
                } else {
                    expect(audioData.timestamp).to.not.equal(timestamp);
                }

                return numberOfFrames + audioData.numberOfFrames;
            }, 0);
        });
    });

    describe('with a vorbis file', () => {
        // bug #25

        let encodedArrayBuffer;
        let json;
        let output;

        beforeEach(async () => {
            [encodedArrayBuffer, json] = await Promise.all([
                loadFixtureAsArrayBuffer(`sine-vorbis.ogg`),
                loadFixtureAsJson(`sine-vorbis.ogg.json`)
            ]);

            output = vi.fn();
        });

        it('should emit multiple instances of the AudioData constructor starting with a wrong timestamp', async () => {
            // eslint-disable-next-line no-undef
            const audioDecoder = new AudioDecoder({
                error: () => {
                    throw new Error('This should never be called.');
                },
                output
            });

            audioDecoder.configure({ ...json.config, description: VORBIS_DESCRIPTION });

            const [{ data, duration }] = json.encodedAudioChunks;

            audioDecoder.decode(
                // eslint-disable-next-line no-undef
                new EncodedAudioChunk({
                    data: encodedArrayBuffer.slice(...data),
                    duration,
                    timestamp: 1000000,
                    type: 'key'
                })
            );

            await audioDecoder.flush();

            expect(output.mock.calls[0][0].timestamp).to.equal(0);
        });
    });
});
