import { AudioData, AudioEncoder, EncodedAudioChunk } from '../../src/module';
import { spy, stub } from 'sinon';
import { KNOWN_AUDIO_CODECS } from '../../src/constants/known-audio-codecs';
import { filterSupportedAudioCodecsForEncoding } from '../helpers/filter-supported-audio-codecs-for-encoding';
import { loadFixtureAsArrayBuffer } from '../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../helpers/load-fixture-as-json';

describe('AudioEncoder', () => {
    let error;
    let output;

    beforeEach(() => {
        error = stub();
        output = stub();

        error.throws(new Error('This should never be called.'));
        output.throws(new Error('This should never be called.'));
    });

    describe('isConfigSupported()', () => {
        describe('with an empty codec', () => {
            it('should throw a TypeError', (done) => {
                AudioEncoder.isConfigSupported({ codec: '' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with an unknown codec', () => {
            it('should throw a TypeError', (done) => {
                AudioEncoder.isConfigSupported({ codec: 'bogus' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a video codec', () => {
            it('should throw a TypeError', (done) => {
                AudioEncoder.isConfigSupported({ codec: 'vp8' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with an ambiguous codec', () => {
            it('should throw a TypeError', (done) => {
                AudioEncoder.isConfigSupported({ codec: 'vp9' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a MIME type as codec', () => {
            it('should throw a TypeError', (done) => {
                AudioEncoder.isConfigSupported({ codec: "audio/webm; codecs='opus'" }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a codec with spaces', () => {
            it('should throw a TypeError', (done) => {
                AudioEncoder.isConfigSupported({ codec: '  opus  ' }).catch((err) => {
                    expect(err).to.be.an.instanceOf(TypeError);

                    done();
                });
            });
        });

        describe('with a known codec', () => {
            for (const codec of KNOWN_AUDIO_CODECS) {
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

                    describe('with a missing numberOfChannels property', () => {
                        beforeEach(() => {
                            delete config.numberOfChannels;
                        });

                        it('should throw a TypeError', (done) => {
                            AudioEncoder.isConfigSupported(config).catch((err) => {
                                expect(err).to.be.an.instanceOf(TypeError);

                                done();
                            });
                        });
                    });

                    describe('with a numberOfChannels of zero', () => {
                        it('should throw a TypeError', (done) => {
                            AudioEncoder.isConfigSupported({ ...config, numberOfChannels: 0 }).catch((err) => {
                                expect(err).to.be.an.instanceOf(TypeError);

                                done();
                            });
                        });
                    });

                    describe('with a numberOfChannels below zero', () => {
                        it('should throw a TypeError', (done) => {
                            AudioEncoder.isConfigSupported({ ...config, numberOfChannels: -10 }).catch((err) => {
                                expect(err).to.be.an.instanceOf(TypeError);

                                done();
                            });
                        });
                    });

                    describe('with a missing sampleRate property', () => {
                        beforeEach(() => {
                            delete config.sampleRate;
                        });

                        it('should throw a TypeError', (done) => {
                            AudioEncoder.isConfigSupported(config).catch((err) => {
                                expect(err).to.be.an.instanceOf(TypeError);

                                done();
                            });
                        });
                    });

                    describe('with a sampleRate of zero', () => {
                        it('should throw a TypeError', (done) => {
                            AudioEncoder.isConfigSupported({ ...config, sampleRate: 0 }).catch((err) => {
                                expect(err).to.be.an.instanceOf(TypeError);

                                done();
                            });
                        });
                    });

                    describe('with a sampleRate below zero', () => {
                        it('should throw a TypeError', (done) => {
                            AudioEncoder.isConfigSupported({ ...config, sampleRate: -10 }).catch((err) => {
                                expect(err).to.be.an.instanceOf(TypeError);

                                done();
                            });
                        });
                    });

                    describe('with a valid AudioEncoderConfig', () => {
                        let supported;

                        beforeEach(() => {
                            supported = filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec);
                        });

                        it('should return an AudioEncoderSupport object', async () => {
                            config.some = 'other property';

                            const audioEncoderSupport = await AudioEncoder.isConfigSupported(config);

                            delete config.some;

                            config.bitrateMode = 'variable';

                            expect(audioEncoderSupport.config).to.not.equal(config);
                            expect(audioEncoderSupport).to.deep.equal({ config, supported });
                        });
                    });
                });
            }
        });
    });

    describe('constructor()', () => {
        describe('with valid options', () => {
            let audioEncoder;

            afterEach(() => {
                if (audioEncoder.state !== 'closed') {
                    audioEncoder.close();
                }
            });

            beforeEach(() => {
                audioEncoder = new AudioEncoder({
                    error,
                    output
                });
            });

            it('should return an instance of the AudioEncoder constructor', () => {
                expect(audioEncoder).to.be.an.instanceOf(AudioEncoder);

                expect(audioEncoder.close).to.be.a('function');
                expect(audioEncoder.configure).to.be.a('function');
                expect(audioEncoder.encode).to.be.a('function');
                expect(audioEncoder.encodeQueueSize).to.equal(0);
                expect(audioEncoder.flush).to.be.a('function');
                expect(audioEncoder.ondequeue).to.be.null;
                expect(audioEncoder.reset).to.be.a('function');
                expect(audioEncoder.state).to.equal('unconfigured');
            });

            it('should return an implementation of the EventTarget constructor', () => {
                expect(audioEncoder).to.be.an.instanceOf(EventTarget);

                expect(audioEncoder.addEventListener).to.be.a('function');
                expect(audioEncoder.dispatchEvent).to.be.a('function');
                expect(audioEncoder.removeEventListener).to.be.a('function');
            });
        });

        describe('with invalid options', () => {
            describe('with a missing error callback', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioEncoder({ output })).to.throw(TypeError);
                });
            });

            describe('with a missing output callback', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioEncoder({ error })).to.throw(TypeError);
                });
            });

            describe('with no callback at all', () => {
                it('should throw a TypeError', () => {
                    expect(() => new AudioEncoder({})).to.throw(TypeError);
                });
            });
        });
    });

    describe('ondequeue', () => {
        let audioEncoder;

        afterEach(() => {
            if (audioEncoder.state !== 'closed') {
                audioEncoder.close();
            }
        });

        beforeEach(() => {
            audioEncoder = new AudioEncoder({
                error,
                output
            });
        });

        it('should be null', () => {
            expect(audioEncoder.ondequeue).to.be.null;
        });

        it('should be assignable to a function', () => {
            const fn = () => {}; // eslint-disable-line unicorn/consistent-function-scoping
            const ondequeue = (audioEncoder.ondequeue = fn); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.equal(fn);
            expect(audioEncoder.ondequeue).to.equal(fn);
        });

        it('should be assignable to null', () => {
            const ondequeue = (audioEncoder.ondequeue = null); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.be.null;
            expect(audioEncoder.ondequeue).to.be.null;
        });

        it('should not be assignable to something else', () => {
            const string = 'no function or null value';

            audioEncoder.ondequeue = () => {};

            const ondequeue = (audioEncoder.ondequeue = string); // eslint-disable-line no-multi-assign

            expect(ondequeue).to.equal(string);
            expect(audioEncoder.ondequeue).to.be.null;
        });

        it('should register an independent event listener', () => {
            const ondequeue = spy();

            audioEncoder.ondequeue = ondequeue;
            audioEncoder.addEventListener('dequeue', ondequeue);

            audioEncoder.dispatchEvent(new Event('dequeue'));

            expect(ondequeue).to.have.been.calledTwice;
        });
    });

    describe('close()', () => {
        let audioEncoder;

        afterEach(() => {
            if (audioEncoder.state !== 'closed') {
                audioEncoder.close();
            }
        });

        beforeEach(() => {
            audioEncoder = new AudioEncoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioEncoder', () => {
            it("should set the state to 'closed'", () => {
                audioEncoder.close();

                expect(audioEncoder.state).to.equal('closed');
            });
        });

        describe('with a configured AudioEncoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            audioEncoder.configure({
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            });
                        });

                        it("should set the state to 'closed'", () => {
                            audioEncoder.close();

                            expect(audioEncoder.state).to.equal('closed');
                        });
                    });
                }
            });
        });

        describe('with a closed AudioEncoder', () => {
            beforeEach(() => audioEncoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioEncoder.close();
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('configure()', () => {
        let audioEncoder;

        afterEach(() => {
            if (audioEncoder.state !== 'closed') {
                audioEncoder.close();
            }
        });

        beforeEach(() => {
            audioEncoder = new AudioEncoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioEncoder', () => {
            describe('with an empty codec', () => {
                let codec;

                beforeEach(() => (codec = ''));

                it('should throw a TypeError', () => {
                    expect(() => audioEncoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioEncoder.configure({ codec });
                    } catch {
                        expect(audioEncoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with an unknown codec', () => {
                let codec;

                beforeEach(() => (codec = 'bogus'));

                it('should throw a TypeError', () => {
                    expect(() => audioEncoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioEncoder.configure({ codec });
                    } catch {
                        expect(audioEncoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a video codec', () => {
                let codec;

                beforeEach(() => (codec = 'vp8'));

                it('should throw a TypeError', () => {
                    expect(() => audioEncoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioEncoder.configure({ codec });
                    } catch {
                        expect(audioEncoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with an ambiguous codec', () => {
                let codec;

                beforeEach(() => (codec = 'vp9'));

                it('should throw a TypeError', () => {
                    expect(() => audioEncoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioEncoder.configure({ codec });
                    } catch {
                        expect(audioEncoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a MIME type as codec', () => {
                let codec;

                beforeEach(() => (codec = "audio/webm; codecs='opus'"));

                it('should throw a TypeError', () => {
                    expect(() => audioEncoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioEncoder.configure({ codec });
                    } catch {
                        expect(audioEncoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a codec with spaces', () => {
                let codec;

                beforeEach(() => (codec = '  opus  '));

                it('should throw a TypeError', () => {
                    expect(() => audioEncoder.configure({ codec })).to.throw(TypeError);
                });

                it('should not change the state', (done) => {
                    try {
                        audioEncoder.configure({ codec });
                    } catch {
                        expect(audioEncoder.state).to.equal('unconfigured');

                        done();
                    }
                });
            });

            describe('with a known codec', () => {
                for (const codec of KNOWN_AUDIO_CODECS) {
                    describe(`with "${codec}"`, () => {
                        let config;

                        beforeEach(() => {
                            config = {
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };
                        });

                        describe('with a missing numberOfChannels property', () => {
                            beforeEach(() => {
                                delete config.numberOfChannels;
                            });

                            it('should throw a TypeError', () => {
                                expect(() => audioEncoder.configure(config)).to.throw(TypeError);
                            });

                            it('should not change the state', (done) => {
                                try {
                                    audioEncoder.configure(config);
                                } catch {
                                    expect(audioEncoder.state).to.equal('unconfigured');

                                    done();
                                }
                            });
                        });

                        describe('with a numberOfChannels of zero', () => {
                            beforeEach(() => {
                                config.numberOfChannels = 0;
                            });

                            it('should throw a TypeError', () => {
                                expect(() => audioEncoder.configure(config)).to.throw(TypeError);
                            });

                            it('should not change the state', (done) => {
                                try {
                                    audioEncoder.configure(config);
                                } catch {
                                    expect(audioEncoder.state).to.equal('unconfigured');

                                    done();
                                }
                            });
                        });

                        describe('with a numberOfChannels below zero', () => {
                            beforeEach(() => {
                                config.numberOfChannels = -10;
                            });

                            it('should throw a TypeError', () => {
                                expect(() => audioEncoder.configure(config)).to.throw(TypeError);
                            });

                            it('should not change the state', (done) => {
                                try {
                                    audioEncoder.configure(config);
                                } catch {
                                    expect(audioEncoder.state).to.equal('unconfigured');

                                    done();
                                }
                            });
                        });

                        describe('with a missing sampleRate property', () => {
                            beforeEach(() => {
                                delete config.sampleRate;
                            });

                            it('should throw a TypeError', () => {
                                expect(() => audioEncoder.configure(config)).to.throw(TypeError);
                            });

                            it('should not change the state', (done) => {
                                try {
                                    audioEncoder.configure(config);
                                } catch {
                                    expect(audioEncoder.state).to.equal('unconfigured');

                                    done();
                                }
                            });
                        });

                        describe('with a sampleRate of zero', () => {
                            beforeEach(() => {
                                config.sampleRate = 0;
                            });

                            it('should throw a TypeError', () => {
                                expect(() => audioEncoder.configure(config)).to.throw(TypeError);
                            });

                            it('should not change the state', (done) => {
                                try {
                                    audioEncoder.configure(config);
                                } catch {
                                    expect(audioEncoder.state).to.equal('unconfigured');

                                    done();
                                }
                            });
                        });

                        describe('with a sampleRate below zero', () => {
                            beforeEach(() => {
                                config.sampleRate = -10;
                            });

                            it('should throw a TypeError', () => {
                                expect(() => audioEncoder.configure(config)).to.throw(TypeError);
                            });

                            it('should not change the state', (done) => {
                                try {
                                    audioEncoder.configure(config);
                                } catch {
                                    expect(audioEncoder.state).to.equal('unconfigured');

                                    done();
                                }
                            });
                        });

                        describe('with a valid AudioEncoderConfig', () => {
                            beforeEach(() => {
                                error.resetBehavior();
                            });

                            if (filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec)) {
                                it('should not trigger a NotSupportedError', async () => {
                                    audioEncoder.configure(config);

                                    expect(error).to.have.not.been.called;

                                    await new Promise((resolve) => {
                                        setTimeout(resolve);
                                    });

                                    expect(error).to.have.not.been.called;
                                });

                                it('should change the state', async () => {
                                    audioEncoder.configure(config);

                                    expect(audioEncoder.state).to.equal('configured');

                                    await new Promise((resolve) => {
                                        setTimeout(resolve);
                                    });

                                    expect(audioEncoder.state).to.equal('configured');
                                });
                            } else {
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
                            }
                        });
                    });
                }
            });
        });

        describe('with a configured AudioEncoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        let config;

                        beforeEach(async () => {
                            config = {
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };

                            audioEncoder.configure(config);

                            await new Promise((resolve) => {
                                setTimeout(resolve);
                            });

                            error.resetBehavior();
                        });

                        if (filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec)) {
                            it('should not trigger a NotSupportedError', async () => {
                                audioEncoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(error).to.have.not.been.called;
                            });

                            it('should change the state', async () => {
                                audioEncoder.configure(config);

                                expect(audioEncoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioEncoder.state).to.equal('configured');
                            });
                        } else {
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
                        }
                    });
                }
            });
        });

        describe('with a closed AudioEncoder', () => {
            beforeEach(() => audioEncoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioEncoder.configure({
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

    describe('encode()', () => {
        let audioData;
        let audioEncoder;

        afterEach(() => {
            if (audioEncoder.state !== 'closed') {
                audioEncoder.close();
            }
        });

        beforeEach(() => {
            audioData = new AudioData({
                data: new Float32Array(10),
                format: 'f32',
                numberOfChannels: 1,
                numberOfFrames: 10,
                sampleRate: 48000,
                timestamp: 0
            });
            audioEncoder = new AudioEncoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioEncoder', () => {
            it('should throw an InvalidStateError', (done) => {
                try {
                    audioEncoder.encode(audioData);
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });

        describe('with a configured AudioEncoder', () => {
            beforeEach(() => {
                output.resetBehavior();
            });

            describe('with a known and supported codec', () => {
                for (const [codec, container, format] of filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent).map(
                    (knownAudioCodec) =>
                        knownAudioCodec === 'mp4a.40.02'
                            ? [knownAudioCodec, 'aac', 's16']
                            : knownAudioCodec === 'mp4a.40.05'
                              ? [knownAudioCodec, 'aac', 's16']
                              : knownAudioCodec === 'mp4a.40.2'
                                ? [knownAudioCodec, 'aac', 's16']
                                : knownAudioCodec === 'mp4a.40.29'
                                  ? [knownAudioCodec, 'aac', 's16']
                                  : knownAudioCodec === 'mp4a.40.5'
                                    ? [knownAudioCodec, 'aac', 's16']
                                    : knownAudioCodec === 'mp4a.67'
                                      ? [knownAudioCodec, 'aac', 's16']
                                      : knownAudioCodec === 'opus'
                                        ? [knownAudioCodec, 'ogg', 's16']
                                        : knownAudioCodec === 'vorbis'
                                          ? [knownAudioCodec, 'ogg', 's16']
                                          : null
                )) {
                    describe(`with "${codec}" wrapped in "${container}"`, () => {
                        let decodedArrayBuffer;
                        let encodedArrayBuffer;
                        let json;

                        beforeEach(async () => {
                            const escapedCodec = codec.replaceAll('.', '-');

                            [decodedArrayBuffer, encodedArrayBuffer, json] = await Promise.all([
                                loadFixtureAsArrayBuffer(`sine-pcm-${format}.wav`),
                                loadFixtureAsArrayBuffer(`sine-pcm-${format}.${escapedCodec}.${container}`),
                                loadFixtureAsJson(`sine-pcm-${format}.${escapedCodec}.json`)
                            ]);

                            audioEncoder.configure(json.config);
                        });

                        it('should emit multiple instances of the EncodedAudioChunk constructor', async () => {
                            json.audioDatas.reduce((timestamp, { data, duration, numberOfFrames }) => {
                                audioEncoder.encode(
                                    new AudioData({
                                        data: decodedArrayBuffer.slice(...data),
                                        format,
                                        numberOfChannels: json.config.numberOfChannels,
                                        numberOfFrames,
                                        sampleRate: json.config.sampleRate,
                                        timestamp
                                    })
                                );

                                return timestamp + duration;
                            }, 0);

                            await audioEncoder.flush();

                            const calls = output.getCalls();

                            expect(calls.length).to.equal(json.encodedAudioChunks.length);

                            calls.reduce((timestamp, call, index) => {
                                expect(call.args.length).to.equal(2);

                                const [encodedAudioChunk, encodedAudioChunkMetadata] = call.args;

                                expect(encodedAudioChunk).to.be.an.instanceOf(EncodedAudioChunk);

                                if (window.EncodedAudioChunk !== undefined) {
                                    expect(encodedAudioChunk).to.be.an.instanceOf(window.EncodedAudioChunk);
                                }

                                const { byteLength, data, decoderConfig, duration, type } = json.encodedAudioChunks[index];

                                // eslint-disable-next-line no-undef
                                if (codec === 'opus' && !process.env.CI && !/Firefox/.test(navigator.userAgent)) {
                                    expect(encodedAudioChunk.byteLength).to.equal(byteLength);
                                }

                                expect(encodedAudioChunk.duration).to.equal(duration);
                                expect(encodedAudioChunk.timestamp).to.equal(timestamp);
                                expect(encodedAudioChunk.type).to.equal(type);

                                // eslint-disable-next-line no-undef
                                if (!process.env.CI && !/Firefox/.test(navigator.userAgent)) {
                                    const uint8Array = new Uint8Array(encodedAudioChunk.byteLength);

                                    encodedAudioChunk.copyTo(uint8Array);

                                    expect(Array.from(uint8Array)).to.deep.equal(
                                        Array.from(new Uint8Array(encodedArrayBuffer.slice(...data)))
                                    );
                                }

                                if (decoderConfig === null) {
                                    expect(encodedAudioChunkMetadata).to.deep.equal({});
                                } else if (decoderConfig.description === undefined) {
                                    expect(encodedAudioChunkMetadata).to.deep.equal({
                                        decoderConfig
                                    });
                                } else if (!/Firefox\/13[7-9]/.test(navigator.userAgent)) {
                                    expect(encodedAudioChunkMetadata).to.deep.equal({
                                        decoderConfig: { ...decoderConfig, description: new Uint8Array(decoderConfig.description).buffer }
                                    });
                                }

                                return (timestamp + duration).toString().endsWith('332') ||
                                    (timestamp + duration).toString().endsWith('999')
                                    ? timestamp + duration + 1
                                    : timestamp + duration;
                            }, 0);
                        });
                    });
                }
            });
        });

        describe('with a closed AudioEncoder', () => {
            beforeEach(() => audioEncoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioEncoder.encode(audioData);
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('flush()', () => {
        let audioEncoder;

        afterEach(() => {
            if (audioEncoder.state !== 'closed') {
                audioEncoder.close();
            }
        });

        beforeEach(() => {
            audioEncoder = new AudioEncoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioEncoder', () => {
            it('should throw an InvalidStateError', (done) => {
                audioEncoder.flush().catch((err) => {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                });
            });
        });

        describe('with a configured AudioEncoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            audioEncoder.configure({
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            });
                        });

                        it('should resolve to undefined', async () => {
                            expect(await audioEncoder.flush()).to.be.undefined;
                        });
                    });
                }
            });
        });

        describe('with a closed AudioEncoder', () => {
            beforeEach(() => audioEncoder.close());

            it('should throw an InvalidStateError', (done) => {
                audioEncoder.flush().catch((err) => {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                });
            });
        });
    });

    describe('reset()', () => {
        let audioEncoder;

        afterEach(() => {
            if (audioEncoder.state !== 'closed') {
                audioEncoder.close();
            }
        });

        beforeEach(() => {
            audioEncoder = new AudioEncoder({
                error,
                output
            });
        });

        describe('with an unconfigured AudioEncoder', () => {
            it('should not change the state', () => {
                audioEncoder.reset();

                expect(audioEncoder.state).to.equal('unconfigured');
            });
        });

        describe('with a configured AudioEncoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForEncoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            audioEncoder.configure({
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            });
                        });

                        it("should set the state to 'unconfigured'", () => {
                            audioEncoder.reset();

                            expect(audioEncoder.state).to.equal('unconfigured');
                        });
                    });
                }
            });
        });

        describe('with a closed AudioEncoder', () => {
            beforeEach(() => audioEncoder.close());

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioEncoder.reset();
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });

            it('should not change the state', (done) => {
                try {
                    audioEncoder.reset();
                } catch {
                    expect(audioEncoder.state).to.equal('closed');

                    done();
                }
            });
        });
    });
});
