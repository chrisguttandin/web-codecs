import { loadFixtureAsArrayBuffer } from '../../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../../helpers/load-fixture-as-json';
import { stub } from 'sinon';

describe('AudioDecoder', () => {
    describe('with a flac file', () => {
        // bug #11

        let encodedArrayBuffer;
        let json;
        let output;

        beforeEach(async () => {
            [encodedArrayBuffer, json] = await Promise.all([
                loadFixtureAsArrayBuffer(`sine-flac.flac`),
                loadFixtureAsJson(`sine-flac.flac.json`)
            ]);

            output = stub();
        });

        it('should emit an instance of AudioData with a wrong timestamp', async () => {
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

            output.getCalls().reduce((timestamp, call, index) => {
                if (timestamp === 4128000) {
                    expect(call.args[0].timestamp).to.equal(4127999);
                } else {
                    expect(call.args[0].timestamp).to.equal(timestamp);
                }

                return timestamp + json.audioDatas[index].duration;
            }, 0);
        });
    });
});
