import { AudioData, AudioDecoder, EncodedAudioChunk } from '../../src/module';
import { spy, stub } from 'sinon';
import { KNOWN_AUDIO_CODECS } from '../../src/constants/known-audio-codecs';
import { VORBIS_DESCRIPTION } from '../helpers/vorbis-description';
import { computeDelta } from '../helpers/compute-delta';
import { filterSupportedAudioCodecsForDecoding } from '../helpers/filter-supported-audio-codecs-for-decoding';
import { loadFixtureAsArrayBuffer } from '../helpers/load-fixture-as-array-buffer';
import { loadFixtureAsJson } from '../helpers/load-fixture-as-json';
import { isSafari } from '../helpers/is-safari';

const FLAC_DESCRIPTION = new Uint8Array([
    102, 76, 97, 67, 0, 0, 0, 34, 18, 0, 18, 0, 0, 0, 186, 0, 5, 57, 11, 184, 0, 240, 0, 3, 169, 128, 148, 172, 171, 223, 193, 198, 120,
    195, 117, 49, 236, 130, 87, 47, 118, 114
]).buffer;

describe('AudioDecoder', () => {
    let error;
    let output;

    beforeEach(() => {
        error = stub();
        output = stub();

        error.throws(new Error('error: This should never be called.'));
        output.throws(new Error('output: This should never be called.'));
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

        describe('with a codec with spaces', () => {
            it('should throw a TypeError', (done) => {
                AudioDecoder.isConfigSupported({ codec: '  mp3  ' }).catch((err) => {
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
                        if (codec === 'flac') {
                            config = {
                                codec,
                                description: FLAC_DESCRIPTION,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };
                        } else if (codec === 'vorbis') {
                            config = {
                                codec,
                                description: VORBIS_DESCRIPTION,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };
                        } else {
                            config = {
                                codec,
                                numberOfChannels: 1,
                                sampleRate: 48000
                            };
                        }

                        error.resetBehavior();
                    });

                    describe('with a valid AudioDecoderConfig', () => {
                        let supported;

                        beforeEach(() => {
                            supported = filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec);
                        });

                        it('should return an AudioDecoderSupport object', async () => {
                            config.some = 'other property';

                            const audioDecoderSupport = await AudioDecoder.isConfigSupported(config);

                            delete config.some;

                            expect(audioDecoderSupport.config).to.not.equal(config);
                            expect(audioDecoderSupport).to.deep.equal({ config, supported });
                        });
                    });
                });
            }
        });
    });

    describe('constructor()', () => {
        describe('with valid options', () => {
            let audioDecoder;

            afterEach(() => {
                if (audioDecoder.state !== 'closed') {
                    audioDecoder.close();
                }
            });

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

        afterEach(() => {
            if (audioDecoder.state !== 'closed') {
                audioDecoder.close();
            }
        });

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

        afterEach(() => {
            if (audioDecoder.state !== 'closed') {
                audioDecoder.close();
            }
        });

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

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            if (codec === 'flac') {
                                audioDecoder.configure({
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else if (codec === 'vorbis') {
                                audioDecoder.configure({
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else {
                                audioDecoder.configure({
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            }
                        });

                        it("should set the state to 'closed'", () => {
                            audioDecoder.close();

                            expect(audioDecoder.state).to.equal('closed');
                        });
                    });
                }
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

        afterEach(() => {
            if (audioDecoder.state !== 'closed') {
                audioDecoder.close();
            }
        });

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

            describe('with a codec with spaces', () => {
                let codec;

                beforeEach(() => (codec = '  mp3  '));

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
                for (const codec of KNOWN_AUDIO_CODECS) {
                    describe(`with "${codec}"`, () => {
                        let config;

                        beforeEach(() => {
                            if (codec === 'flac') {
                                config = {
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else if (codec === 'vorbis') {
                                config = {
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else {
                                config = {
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            }

                            error.resetBehavior();
                        });

                        if (filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec)) {
                            it('should not trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(error).to.have.not.been.called;
                            });

                            it('should change the state', async () => {
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioDecoder.state).to.equal('configured');
                            });
                        } else {
                            it('should trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    // Bug #30: The patch necessary for Safari requires a small delay.
                                    setTimeout(resolve, 100);
                                });

                                expect(error).to.have.been.calledOnce;

                                const { args } = error.getCall(0);

                                expect(args.length).to.equal(1);
                                expect(args[0].code).to.equal(9);
                                expect(args[0].name).to.equal('NotSupportedError');
                            });

                            it('should change the state', async () => {
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    // Bug #30: The patch necessary for Safari requires a small delay.
                                    setTimeout(resolve, 100);
                                });

                                expect(audioDecoder.state).to.equal('closed');
                            });
                        }
                    });
                }
            });
        });

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        let config;

                        beforeEach(async () => {
                            if (codec === 'flac') {
                                config = {
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else if (codec === 'vorbis') {
                                config = {
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            } else {
                                config = {
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                };
                            }

                            audioDecoder.configure(config);

                            await new Promise((resolve) => {
                                setTimeout(resolve);
                            });

                            error.resetBehavior();
                        });

                        if (filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent).includes(codec)) {
                            it('should not trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

                                expect(error).to.have.not.been.called;

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(error).to.have.not.been.called;
                            });

                            it('should change the state', async () => {
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioDecoder.state).to.equal('configured');
                            });
                        } else {
                            it('should trigger a NotSupportedError', async () => {
                                audioDecoder.configure(config);

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
                                audioDecoder.configure(config);

                                expect(audioDecoder.state).to.equal('configured');

                                await new Promise((resolve) => {
                                    setTimeout(resolve);
                                });

                                expect(audioDecoder.state).to.equal('closed');
                            });
                        }
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

        afterEach(() => {
            if (audioDecoder.state !== 'closed') {
                audioDecoder.close();
            }
        });

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

        describe('with a configured AudioDecoder', () => {
            beforeEach(() => {
                output.resetBehavior();
            });

            describe('with a known and supported codec', () => {
                for (const [codec, container, format] of filterSupportedAudioCodecsForDecoding(
                    KNOWN_AUDIO_CODECS.filter(
                        (knownAudioCodec) =>
                            ![
                                'mp4a.40.02',
                                'mp4a.40.05',
                                'mp4a.40.29',
                                'mp4a.40.5',
                                'mp4a.67',
                                'mp4a.69',
                                'mp4a.6B',
                                'pcm-f32',
                                'pcm-s16',
                                'pcm-s24',
                                'pcm-s32',
                                'pcm-u8'
                            ].includes(knownAudioCodec)
                    ),
                    navigator.userAgent
                )
                    .map((knownAudioCodec) =>
                        knownAudioCodec === 'alaw'
                            ? [[knownAudioCodec, 'wav', 's16']]
                            : knownAudioCodec === 'flac'
                              ? [[knownAudioCodec, 'flac', 's16']]
                              : knownAudioCodec === 'mp3'
                                ? [[knownAudioCodec, 'mp3', 's16-planar']]
                                : knownAudioCodec === 'mp4a.40.2'
                                  ? [
                                        [knownAudioCodec, 'aac', 'f32-planar'],
                                        [knownAudioCodec, 'mp4', 'f32-planar']
                                    ]
                                  : knownAudioCodec === 'opus'
                                    ? [[knownAudioCodec, 'ogg', 'f32']]
                                    : knownAudioCodec === 'ulaw'
                                      ? [[knownAudioCodec, 'wav', 's16']]
                                      : knownAudioCodec === 'vorbis'
                                        ? [[knownAudioCodec, 'ogg', 'f32-planar']]
                                        : null
                    )
                    .flat()) {
                    describe(`with "${codec}" wrapped in "${container}"`, () => {
                        let decodedArrayBuffer;
                        let encodedArrayBuffer;
                        let json;

                        beforeEach(async () => {
                            const escapedCodec = codec.replaceAll('.', '-');

                            [decodedArrayBuffer, encodedArrayBuffer, json] = await Promise.all([
                                loadFixtureAsArrayBuffer(`sine-${escapedCodec}.${format}.wav`),
                                loadFixtureAsArrayBuffer(`sine-${escapedCodec}.${container}`),
                                loadFixtureAsJson(`sine-${escapedCodec}.${container}.json`)
                            ]);

                            if (codec === 'vorbis') {
                                audioDecoder.configure({ ...json.config, description: VORBIS_DESCRIPTION });
                            } else if (json.config.description === undefined) {
                                audioDecoder.configure(json.config);
                            } else {
                                audioDecoder.configure({
                                    ...json.config,
                                    description: encodedArrayBuffer.slice(...json.config.description)
                                });
                            }
                        });

                        for (const timestampOffset of [0, 1000000]) {
                            describe(`with an initial timestamp offset of ${timestampOffset} microseconds`, () => {
                                it('should emit multiple instances of the AudioData constructor', async () => {
                                    json.encodedAudioChunks.reduce((timestamp, { data, duration }) => {
                                        audioDecoder.decode(
                                            new EncodedAudioChunk({
                                                data: encodedArrayBuffer.slice(...data),
                                                duration,
                                                timestamp,
                                                type: 'key'
                                            })
                                        );

                                        return timestamp + duration;
                                    }, timestampOffset);

                                    await audioDecoder.flush();

                                    const calls = output.getCalls();

                                    if (navigator.userAgent.includes('Firefox') && codec === 'vorbis') {
                                        json.audioDatas.unshift({ data: [58, 58], duration: 0, numberOfFrames: 0 });
                                    }

                                    // Bug #29: Safari encodes PCM data in chunks.
                                    if (isSafari(navigator) && ['alaw', 'ulaw'].includes(codec)) {
                                        expect(json.audioDatas.length).to.equal(1);

                                        const [audioData] = json.audioDatas;
                                        const bytesPerFrame = 2;
                                        const numberOfFramesPerChunk = 2048;

                                        json.audioDatas = Array.from(
                                            { length: Math.ceil(audioData.numberOfFrames / numberOfFramesPerChunk) },
                                            (_, index) => {
                                                const data = [
                                                    audioData.data[0] + numberOfFramesPerChunk * bytesPerFrame * index,
                                                    Math.min(
                                                        audioData.data[0] + numberOfFramesPerChunk * bytesPerFrame * (index + 1),
                                                        audioData.data[1]
                                                    )
                                                ];
                                                const numberOfFrames = (data[1] - data[0]) / bytesPerFrame;
                                                const duration = Math.floor((numberOfFrames * 1000000) / json.config.sampleRate);

                                                return {
                                                    data,
                                                    duration,
                                                    numberOfFrames
                                                };
                                            }
                                        );
                                    }

                                    expect(calls.length).to.equal(json.audioDatas.length);

                                    calls.reduce((totalNumberOfFrames, call, index) => {
                                        expect(call.args.length).to.equal(1);

                                        const [audioData] = call.args;

                                        expect(audioData).to.be.an.instanceOf(AudioData);

                                        if (window.AudioData !== undefined) {
                                            expect(audioData).to.be.an.instanceOf(window.AudioData);
                                        }

                                        const { data, duration, numberOfFrames } = json.audioDatas[index];

                                        expect(audioData.duration).to.equal(duration);
                                        expect(audioData.format).to.equal(/Chrome/.test(navigator.userAgent) ? format : 'f32');
                                        expect(audioData.numberOfChannels).to.equal(json.config.numberOfChannels);
                                        expect(audioData.numberOfFrames).to.equal(numberOfFrames);
                                        expect(audioData.sampleRate).to.equal(json.config.sampleRate);

                                        // Bug #25: Firefox always starts with a timestamp of 0.
                                        if (navigator.userAgent.includes('Firefox') && codec === 'vorbis') {
                                            expect(audioData.timestamp).to.equal(
                                                Math.floor((totalNumberOfFrames * 1000000) / audioData.sampleRate)
                                            );
                                        } else {
                                            expect(audioData.timestamp).to.equal(
                                                timestampOffset + Math.floor((totalNumberOfFrames * 1000000) / audioData.sampleRate)
                                            );
                                        }

                                        // eslint-disable-next-line no-undef
                                        if (!process.env.CI && duration > 0) {
                                            const uint8Array = new Uint8Array(audioData.allocationSize({ format, planeIndex: 0 }));

                                            audioData.copyTo(uint8Array, { format, planeIndex: 0 });

                                            if (!/Chrome/.test(navigator.userAgent) && codec === 'mp3') {
                                                const int16Array = new Int16Array(uint8Array.buffer);
                                                const decodedInt16Array = new Int16Array(decodedArrayBuffer.slice(...data));

                                                for (let i = 0; i < Math.max(int16Array.length, decodedInt16Array.length); i += 1) {
                                                    expect(int16Array[i]).to.be.closeTo(decodedInt16Array[i], 1);
                                                }
                                            } else if (
                                                !/Chrome/.test(navigator.userAgent) &&
                                                ['mp4a.40.2', 'opus', 'vorbis'].includes(codec)
                                            ) {
                                                const float32Array = new Float32Array(uint8Array.buffer);
                                                const decodedFloat32Array = new Float32Array(decodedArrayBuffer.slice(...data));

                                                for (let i = 0; i < Math.max(float32Array.length, decodedFloat32Array.length); i += 1) {
                                                    expect(float32Array[i]).to.be.closeTo(
                                                        decodedFloat32Array[i],
                                                        computeDelta(decodedFloat32Array[i], 's16', 'f32')
                                                    );
                                                }
                                            } else {
                                                expect(Array.from(uint8Array)).to.deep.equal(
                                                    Array.from(new Uint8Array(decodedArrayBuffer.slice(...data)))
                                                );
                                            }
                                        }

                                        return totalNumberOfFrames + numberOfFrames;
                                    }, 0);
                                });
                            });
                        }
                    });
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

        afterEach(() => {
            if (audioDecoder.state !== 'closed') {
                audioDecoder.close();
            }
        });

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

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            if (codec === 'flac') {
                                audioDecoder.configure({
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else if (codec === 'vorbis') {
                                audioDecoder.configure({
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else {
                                audioDecoder.configure({
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            }
                        });

                        it('should resolve to undefined', async () => {
                            expect(await audioDecoder.flush()).to.be.undefined;
                        });
                    });
                }
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

        afterEach(() => {
            if (audioDecoder.state !== 'closed') {
                audioDecoder.close();
            }
        });

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

        describe('with a configured AudioDecoder', () => {
            describe('with a known and supported codec', () => {
                for (const codec of filterSupportedAudioCodecsForDecoding(KNOWN_AUDIO_CODECS, navigator.userAgent)) {
                    describe(`with "${codec}"`, () => {
                        beforeEach(() => {
                            if (codec === 'flac') {
                                audioDecoder.configure({
                                    codec,
                                    description: FLAC_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else if (codec === 'vorbis') {
                                audioDecoder.configure({
                                    codec,
                                    description: VORBIS_DESCRIPTION,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            } else {
                                audioDecoder.configure({
                                    codec,
                                    numberOfChannels: 1,
                                    sampleRate: 48000
                                });
                            }
                        });

                        it("should set the state to 'unconfigured'", () => {
                            audioDecoder.reset();

                            expect(audioDecoder.state).to.equal('unconfigured');
                        });
                    });
                }
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
