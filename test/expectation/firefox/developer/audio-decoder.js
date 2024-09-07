import { loadFixtureAsArrayBuffer } from '../../../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../../../helpers/load-fixture-as-json';
import { stub } from 'sinon';

describe('AudioDecoder', () => {
    describe('with a flac file', () => {
        // bug #19

        let encodedArrayBuffer;
        let error;
        let json;

        beforeEach(async () => {
            [encodedArrayBuffer, json] = await Promise.all([
                loadFixtureAsArrayBuffer(`sine-flac.flac`),
                loadFixtureAsJson(`sine-flac.flac.json`)
            ]);

            error = stub();
        });

        it('should trigger an EncodingError', async () => {
            // eslint-disable-next-line no-undef
            const { supported } = await AudioDecoder.isConfigSupported({
                ...json.config,
                description: encodedArrayBuffer.slice(...json.config.description)
            });

            expect(supported).to.be.true;

            // eslint-disable-next-line no-undef
            const audioDecoder = new AudioDecoder({
                error,
                output: () => {
                    throw new Error('This should never be called.');
                }
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

            try {
                await audioDecoder.flush();
            } catch (err) {
                expect(err.code).to.equal(0);
                expect(err.name).to.equal('EncodingError');
            }

            expect(error).to.have.been.calledOnce;

            const calls = error.getCalls();

            expect(calls.length).to.equal(1);

            const { args } = calls[0];

            expect(args.length).to.equal(1);
            expect(args[0].code).to.equal(0);
            expect(args[0].name).to.equal('EncodingError');
        });
    });

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

            output = stub();
        });

        it('should emit multiple instances of AudioData with a wrong timestamp', async () => {
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

            output.getCalls().reduce((numberOfFrames, call) => {
                const [audioData] = call.args;
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
});
