import { loadFixtureAsArrayBuffer } from '../../../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../../../helpers/load-fixture-as-json';
import { stub } from 'sinon';

describe('AudioDecoder', () => {
    for (const codec of ['alaw', 'ulaw']) {
        describe(`with an ${codec} file`, () => {
            // bug #29

            let encodedArrayBuffer;
            let json;
            let output;

            beforeEach(async () => {
                [encodedArrayBuffer, json] = await Promise.all([
                    loadFixtureAsArrayBuffer(`sine-${codec}.wav`),
                    loadFixtureAsJson(`sine-${codec}.wav.json`)
                ]);

                output = stub();
            });

            it('should emit multiple instances of the AudioData constructor with a maximum numberOfFrames and a wrong timestamp', async () => {
                // eslint-disable-next-line no-undef
                const audioDecoder = new AudioDecoder({
                    error: () => {
                        throw new Error('This should never be called.');
                    },
                    output
                });

                audioDecoder.configure(json.config);
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

                const calls = output.getCalls();

                expect(calls.length).to.equal(118);
                expect(
                    calls.reduce(
                        ([duration, numberOfFrames], call) => {
                            const [audioData] = call.args;

                            expect(audioData.duration).to.be.at.most(42666);
                            expect(audioData.numberOfFrames).to.be.at.most(2048);

                            const timestamp = Math.floor((numberOfFrames * 1000000) / audioData.sampleRate);

                            if (duration === timestamp) {
                                expect(audioData.timestamp).to.equal(duration);
                            } else {
                                expect(audioData.timestamp).to.equal(duration + 1);

                                duration = audioData.timestamp;
                            }

                            return [duration + audioData.duration, numberOfFrames + audioData.numberOfFrames];
                        },
                        [0, 0]
                    )
                ).to.deep.equal([json.audioDatas[0].duration, json.audioDatas[0].numberOfFrames]);
            });
        });
    }

    describe('with a flac file', () => {
        // bug #30

        let encodedArrayBuffer;
        let error;
        let json;
        let output;

        beforeEach(async () => {
            [encodedArrayBuffer, json] = await Promise.all([
                loadFixtureAsArrayBuffer(`sine-flac.flac`),
                loadFixtureAsJson(`sine-flac.flac.json`)
            ]);

            error = stub();
            output = stub();
        });

        it('should throw an error', async () => {
            // eslint-disable-next-line no-undef
            const audioDecoder = new AudioDecoder({
                error,
                output
            });

            audioDecoder.configure({ ...json.config, description: encodedArrayBuffer.slice(...json.config.description) });

            const [{ data, duration }] = json.encodedAudioChunks;

            audioDecoder.decode(
                // eslint-disable-next-line no-undef
                new EncodedAudioChunk({
                    data: encodedArrayBuffer.slice(...data),
                    duration,
                    timestamp: 0,
                    type: 'key'
                })
            );

            try {
                await audioDecoder.flush();

                throw new Error('This should never be called.');
            } catch (err) {
                expect(err.message).to.equal('InternalAudioDecoderCocoa decoding failed');
            }

            expect(error).to.have.been.calledOnce;

            const { args } = error.getCall(0);

            expect(args.length).to.equal(1);
            expect(args[0].code).to.equal(0);
            expect(args[0].name).to.equal('EncodingError');

            expect(output).to.have.not.been.called;
        });
    });
});
