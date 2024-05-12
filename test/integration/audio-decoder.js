import { AudioDecoder, EncodedAudioChunk } from '../../src/module';
import { spy, stub } from 'sinon';
import { KNOWN_AUDIO_CODECS } from '../../src/constants/known-audio-codecs';

describe('AudioDecoder', () => {
    let error;
    let output;

    beforeEach(() => {
        error = stub();
        output = () => {
            throw new Error('This should never be called.');
        };

        error.throws(new Error('This should never be called.'));
    });

    describe('isConfigSupported()', () => {
        describe('with an empty codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: '' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with an unknown codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: 'bogus' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a video codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: 'vp8' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with an ambiguous codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: 'vp9' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a MIME type as codec', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: "audio/webm; codecs='opus'" }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a known codec', () => {
            for (const codec of KNOWN_AUDIO_CODECS.filter((knownAudioCodec) => !['flac', 'vorbis'].includes(knownAudioCodec))) {
                describe(`with "${codec}"`, () => {
                    let config;

                    beforeEach(() => {
                        config = {
                            codec,
                            numberOfChannels: 1,
                            sampleRate: 48000
                        };

                        error.resetBehavior();
                    });

                    it('should return an AudioDecoderSupport object', async () => {
                        config.some = 'other property';

                        const audioDecoderSupport = await AudioDecoder.isConfigSupported(config);

                        delete config.some;

                        expect(audioDecoderSupport.config).to.not.equal(config);
                        expect(audioDecoderSupport.supported).to.be.a('boolean');
                        expect(audioDecoderSupport).to.deep.equal({ config, supported: audioDecoderSupport.supported });
                    });
                });
            }
        });
    });

    describe('constructor()', () => {
        describe('with valid options', () => {
            let audioDecoder;

            beforeEach(() => {
                audioDecoder = new AudioDecoder({
                    error,
                    output
                });
            });

            it('should return an instance of the AudioDecoder constructor', () => {
                expect(audioDecoder).to.be.an.instanceOf(AudioDecoder);

                expect(audioDecoder.close).to.be.a('function');
                expect(audioDecoder.configure).to.be.a('function');
                expect(audioDecoder.decode).to.be.a('function');
                expect(audioDecoder.decodeQueueSize).to.equal(0);
                expect(audioDecoder.flush).to.be.a('function');
                expect(audioDecoder.ondequeue).to.be.null;
                expect(audioDecoder.reset).to.be.a('function');
                expect(audioDecoder.state).to.equal('unconfigured');
            });

            it('should return an implementation of the EventTarget constructor', () => {
                expect(audioDecoder).to.be.an.instanceOf(EventTarget);

                expect(audioDecoder.addEventListener).to.be.a('function');
                expect(audioDecoder.dispatchEvent).to.be.a('function');
                expect(audioDecoder.removeEventListener).to.be.a('function');
            });
        });

        describe('with invalid options', () => {
            describe('with a missing error callback', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioDecoder({ output })).to.throw(TypeError);
                });
            });

            describe('with a missing output callback', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioDecoder({ error })).to.throw(TypeError);
                });
            });

            describe('with no callback at all', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioDecoder({})).to.throw(TypeError);
                });
            });
        });
    });

    describe('ondequeue', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        it('should be null', () => {
            expect(audioDecoder.ondequeue).to.be.null;
        });

        it('should be assignable to a function', () => {
            const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
            const ondequeue = (audioDecoder.ondequeue = fn); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.equal(fn);
            expect(audioDecoder.ondequeue).to.equal(fn);
        });

        it('should be assignable to null', () => {
            const ondequeue = (audioDecoder.ondequeue = null); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.be.null;
            expect(audioDecoder.ondequeue).to.be.null;
        });

        it('should not be assignable to something else', () => {
            const string = 'no function or null value';

            audioDecoder.ondequeue = () => {};

            const ondequeue = (audioDecoder.ondequeue = string); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.equal(string);
            expect(audioDecoder.ondequeue).to.be.null;
        });

        it('should register an independent event listener', () => {
            const ondequeue = spy();

            audioDecoder.ondequeue = ondequeue;
            audioDecoder.addEventListener('dequeue', ondequeue);

            audioDecoder.dispatchEvent(new Event('dequeue'));

            expect(ondequeue).to.have.been.calledTwice;
        });
    });

    describe('close()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it("should set the state to 'closed'", () => {
                audioDecoder.close();

                expect(audioDecoder.state).to.equal('closed');
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.close();
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('configure()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            describe('with an empty codec', () => {
                let codec;

                beforeEach(() => (codec = ''));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with an unknown codec', () => {
                let codec;

                beforeEach(() => (codec = 'bogus'));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a video codec', () => {
                let codec;

                beforeEach(() => (codec = 'vp8'));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with an ambiguous codec', () => {
                let codec;

                beforeEach(() => (codec = 'vp9'));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a MIME type as codec', () => {
                let codec;

                beforeEach(() => (codec = "audio/webm; codecs='opus'"));

                it('should throw a TypeError', () => {
                    expect(() => audioDecoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioDecoder.configure({ codec });
                    } catch {
                        expect(audioDecoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a known codec', () => {
                for (const codec of KNOWN_AUDIO_CODECS.filter((knownAudioCodec) => !['flac', 'vorbis'].includes(knownAudioCodec))) {
                    describe(`with "${codec}"`, () => {
                        let config;
                        let isConfigSupported;

                        before(() => {
                            isConfigSupported = true;
                        });

                        beforeEach(() => {
                            config = {
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };

                            error.resetBehavior();
                        });

                        it('should trigger a NotSupportedError if not supported', async () => {
                            audioDecoder.configure(config);

                            expect(error).to.have.not.been.called;

                            await new Promise((resolve) => {
                                setTimeout(resolve);
                            });

                            try {
                                expect(error).to.have.not.been.called;
                            } catch {
                                isConfigSupported = false;

                                expect(error).to.have.been.calledOnce;

                                const { args } = error.getCall(0);

                                expect(args.length).to.equal(1);
                                expect(args[0].code).to.equal(9);
                                expect(args[0].name).to.equal('NotSupportedError');
                            }
                        });

                        it('should change the state', async () => {
                            audioDecoder.configure(config);

                            expect(audioDecoder.state).to.equal('configured');

                            await new Promise((resolve) => {
                                setTimeout(resolve);
                            });

                            if (isConfigSupported) {
                                expect(audioDecoder.state).to.equal('configured');
                            } else {
                                expect(audioDecoder.state).to.equal('closed');
                            }
                        });
                    });
                }
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.configure({
                        codec: 'mp4a.40.2',
                        numberOfChannels: 1,
                        sampleRate: 48000
                    });
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('decode()', () => {
        let audioDecoder;
        let encodedAudioChunk;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
            encodedAudioChunk = new EncodedAudioChunk({ data: Uint8Array.of(0), timestamp: 0, type: 'key' });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.decode(encodedAudioChunk);
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.decode(encodedAudioChunk);
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('flush()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it('should throw an InvalidStateError', (done) => {
                audioDecoder.flush().catch((err) => {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                });
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                audioDecoder.flush().catch((err) => {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                });
            });
        });
    });

    describe('reset()', () => {
        let audioDecoder;

        beforeEach(() => {
            audioDecoder = new AudioDecoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioDecoder', () => {
            it('should not change the state', () => {
                audioDecoder.reset();

                expect(audioDecoder.state).to.equal('unconfigured');
            });
        });

        describe('with a closed AudioDecoder', () => {
            beforeEach(() => audioDecoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioDecoder.reset();
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });

            it('should not change the state', (done) => {
                try {
                    audioDecoder.reset();
                } catch {
                    expect(audioDecoder.state).to.equal('closed');

                    done();
                }
            });
        });
    });
});
