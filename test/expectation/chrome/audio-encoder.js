import { loadFixtureAsArrayBuffer } from '../../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../../helpers/load-fixture-as-json';
import { spy } from 'sinon';

describe('AudioEncoder', () => {
    describe('isConfigSupported()', () => {
        describe('with a numberOfChannels of zero', () => {
            // bug #7

            it('should return an AudioEncoderSupport object', async () => {
                const config = { bitrateMode: 'variable', codec: 'alaw', numberOfChannels: 0, sampleRate: 48000 };

                // eslint-disable-next-line no-undef
                expect(await AudioEncoder.isConfigSupported(config)).to.deep.equal({ config, supported: false });
            });
        });

        describe('with a sampleRate of zero', () => {
            // bug #8

            it('should return an AudioEncoderSupport object', async () => {
                const config = { bitrateMode: 'variable', codec: 'alaw', numberOfChannels: 1, sampleRate: 0 };

                // eslint-disable-next-line no-undef
                expect(await AudioEncoder.isConfigSupported(config)).to.deep.equal({ config, supported: false });
            });
        });
    });

    describe('configure()', () => {
        let audioEncoder;
        let error;

        beforeEach(() => {
            error = spy();

            // eslint-disable-next-line no-undef
            audioEncoder = new AudioEncoder({
                error,
                output: () => {
                    throw new Error('This should never be called.');
                }
            });
        });

        describe('with a numberOfChannels of zero', () => {
            // bug #9

            let config;

            beforeEach(() => {
                config = { bitrateMode: 'variable', codec: 'alaw', numberOfChannels: 0, sampleRate: 48000 };
            });

            it('should trigger a NotSupportedError', async () => {
                audioEncoder.configure(config);

                expect(error).to.have.not.been.called;

                await new Promise((resolve) => {
                    setTimeout(resolve);
                });

                expect(error).to.have.been.calledOnce;

                const { args } = error.getCall(0);

                expect(args.length).to.equal(1);
                expect(args[0].code).to.equal(9);
                expect(args[0].name).to.equal('NotSupportedError');
            });

            it('should change the state', async () => {
                audioEncoder.configure(config);

                expect(audioEncoder.state).to.equal('configured');

                await new Promise((resolve) => {
                    setTimeout(resolve);
                });

                expect(audioEncoder.state).to.equal('closed');
            });
        });

        describe('with a sampleRate of zero', () => {
            // bug #10

            let config;

            beforeEach(() => {
                config = { bitrateMode: 'variable', codec: 'alaw', numberOfChannels: 1, sampleRate: 0 };
            });

            it('should trigger a NotSupportedError', async () => {
                audioEncoder.configure(config);

                expect(error).to.have.not.been.called;

                await new Promise((resolve) => {
                    setTimeout(resolve);
                });

                expect(error).to.have.been.calledOnce;

                const { args } = error.getCall(0);

                expect(args.length).to.equal(1);
                expect(args[0].code).to.equal(9);
                expect(args[0].name).to.equal('NotSupportedError');
            });

            it('should change the state', async () => {
                audioEncoder.configure(config);

                expect(audioEncoder.state).to.equal('configured');

                await new Promise((resolve) => {
                    setTimeout(resolve);
                });

                expect(audioEncoder.state).to.equal('closed');
            });
        });
    });

    describe('encode()', () => {
        let audioEncoder;
        let output;

        beforeEach(() => {
            output = spy();

            // eslint-disable-next-line no-undef
            audioEncoder = new AudioEncoder({
                error: () => {
                    throw new Error('This should never be called.');
                },
                output
            });
        });

        describe('with an opus file', () => {
            let decodedArrayBuffer;
            let json;

            beforeEach(async () => {
                [decodedArrayBuffer, json] = await Promise.all([
                    loadFixtureAsArrayBuffer(`sine-pcm-s16.wav`),
                    loadFixtureAsJson(`sine-pcm-s16.opus.json`)
                ]);
            });

            // bug #12
            it('should emit an instance of AudioData with a wrong duration', async () => {
                audioEncoder.configure(json.config);
                json.audioDatas.reduce((timestamp, { data, duration, numberOfFrames }) => {
                    audioEncoder.encode(
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

                for (const call of output.getCalls()) {
                    const { duration, timestamp } = call.args[0];

                    if ([240000, 500000, 1020000, 2040000, 4080000].includes(timestamp)) {
                        expect(duration).to.equal(19999);
                    } else if ([259999, 519999, 1039999, 2079999, 4179999].includes(timestamp)) {
                        expect(duration).to.equal(20001);
                    } else {
                        expect(duration).to.equal(20000);
                    }
                }
            });

            // bug #13
            it('should emit an instance of AudioData with a wrong timestamp', async () => {
                audioEncoder.configure(json.config);
                json.audioDatas.reduce((timestamp, { data, duration, numberOfFrames }) => {
                    audioEncoder.encode(
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

                output.getCalls().reduce((timestamp, call, index) => {
                    if ([260000, 520000, 1040000, 2060000, 2080000, 4100000, 4120000, 4140000, 4160000, 4180000].includes(timestamp)) {
                        expect(call.args[0].timestamp).to.equal(timestamp - 1);
                    } else {
                        expect(call.args[0].timestamp).to.equal(timestamp);
                    }

                    return timestamp + json.encodedAudioChunks[index].duration;
                }, 0);
            });
        });
    });
});
