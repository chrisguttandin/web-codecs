import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadFixtureAsArrayBuffer } from '../../../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../../../helpers/load-fixture-as-json';

describe('AudioEncoder', () => {
    describe('when encoding as opus', () => {
        // bug #20

        let decodedArrayBuffer;
        let json;
        let output;

        beforeEach(async () => {
            [decodedArrayBuffer, json] = await Promise.all([
                loadFixtureAsArrayBuffer(`sine-pcm-s16.wav`),
                loadFixtureAsJson(`sine-pcm-s16.opus.firefox.json`)
            ]);

            output = vi.fn();
        });

        it('should emit multiple instances of the EncodedAudioChunk constructor with a wrong timestamp', async () => {
            // eslint-disable-next-line no-undef
            const audioEncoder = new AudioEncoder({
                error: () => {
                    throw new Error('This should never be called.');
                },
                output
            });

            audioEncoder.configure(json.config);
            json.audioDatas.reduce((timestamp, { data, duration, numberOfFrames }) => {
                audioEncoder.encode(
                    // eslint-disable-next-line no-undef
                    new AudioData({
                        data: decodedArrayBuffer.slice(...data),
                        format: 's16',
                        numberOfChannels: json.config.numberOfChannels,
                        numberOfFrames,
                        sampleRate: json.config.sampleRate,
                        timestamp
                    })
                );

                return timestamp + duration;
            }, 0);

            await audioEncoder.flush();

            output.mock.calls.reduce((timestamp, [encodedAudioChunk], index) => {
                const { duration } = json.encodedAudioChunks[index];

                expect(encodedAudioChunk.timestamp).to.equal(Math.max(0, timestamp - 6500));

                return timestamp + duration;
            }, 0);
        });
    });

    describe('when encoding as vorbis', () => {
        // bug #21

        let decodedArrayBuffer;
        let json;
        let output;

        beforeEach(async () => {
            [decodedArrayBuffer, json] = await Promise.all([
                loadFixtureAsArrayBuffer(`sine-pcm-s16.wav`),
                loadFixtureAsJson(`sine-pcm-s16.vorbis.json`)
            ]);

            output = vi.fn();
        });

        it('should emit multiple instances of the EncodedAudioChunk constructor with a wrong duration', async () => {
            // eslint-disable-next-line no-undef
            const audioEncoder = new AudioEncoder({
                error: () => {
                    throw new Error('This should never be called.');
                },
                output
            });

            audioEncoder.configure(json.config);
            json.audioDatas.reduce((timestamp, { data, duration, numberOfFrames }) => {
                audioEncoder.encode(
                    // eslint-disable-next-line no-undef
                    new AudioData({
                        data: decodedArrayBuffer.slice(...data),
                        format: 's16',
                        numberOfChannels: json.config.numberOfChannels,
                        numberOfFrames,
                        sampleRate: json.config.sampleRate,
                        timestamp
                    })
                );

                return timestamp + duration;
            }, 0);

            await audioEncoder.flush();

            output.mock.calls.forEach(([encodedAudioChunk], index) => {
                const { duration } = json.encodedAudioChunks[index];

                expect(encodedAudioChunk.duration).to.not.equal(duration);
            });
        });
    });
});
