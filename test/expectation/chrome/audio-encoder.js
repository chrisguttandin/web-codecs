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
});
