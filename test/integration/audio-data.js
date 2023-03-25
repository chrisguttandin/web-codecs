import { AudioData } from '../../src/module';

describe('AudioData', () => {
    describe('constructor()', () => {
        let data;
        let format;
        let numberOfChannels;
        let numberOfFrames;
        let sampleRate;
        let timestamp;

        beforeEach(() => {
            numberOfChannels = 2;
            numberOfFrames = 100;
            data = new Float32Array(numberOfChannels * numberOfFrames);
            format = 'f32-planar';
            sampleRate = 8000;
            timestamp = 1234;
        });

        describe('with valid options', () => {
            it('should return an instance of the AudioData constructor', () => {
                const audioData = new AudioData({
                    data,
                    format,
                    numberOfChannels,
                    numberOfFrames,
                    sampleRate,
                    timestamp
                });

                expect(audioData).to.be.an.instanceOf(AudioData);

                expect(audioData.allocationSize).to.be.a('function');
                expect(audioData.clone).to.be.a('function');
                expect(audioData.close).to.be.a('function');
                expect(audioData.copyTo).to.be.a('function');
                expect(audioData.duration).to.equal((numberOfFrames / sampleRate) * 1000000);
                expect(audioData.format).to.equal(format);
                expect(audioData.numberOfChannels).to.equal(numberOfChannels);
                expect(audioData.numberOfFrames).to.equal(numberOfFrames);
                expect(audioData.sampleRate).to.equal(sampleRate);
                expect(audioData.timestamp).to.equal(timestamp);
            });

            it('should return an instance with a negative timestamp', () => {
                const audioData = new AudioData({
                    data,
                    format,
                    numberOfChannels,
                    numberOfFrames,
                    sampleRate,
                    timestamp: -10
                });

                expect(audioData.timestamp).to.equal(-10);
            });
        });

        describe('with invalid options', () => {
            describe('with a missing data property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                format,
                                numberOfChannels,
                                numberOfFrames,
                                sampleRate,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a BufferSource that is too small', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data: new Int16Array(numberOfChannels * numberOfFrames),
                                format,
                                numberOfChannels,
                                numberOfFrames,
                                sampleRate,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a missing format property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                numberOfChannels,
                                numberOfFrames,
                                sampleRate,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a missing numberOfChannels property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfFrames,
                                sampleRate,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a numberOfChannels below zero', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels: -10,
                                numberOfFrames,
                                sampleRate,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a missing numberOfFrames property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels,
                                sampleRate,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a numberOfFrames below zero', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels,
                                numberOfFrames: -10,
                                sampleRate,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a missing sampleRate property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels,
                                numberOfFrames,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a sampleRate below zero', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels,
                                numberOfFrames,
                                sampleRate: -10,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a missing timestamp property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels,
                                numberOfFrames,
                                sampleRate
                            })
                    ).to.throw(TypeError);
                });
            });
        });
    });

    describe('allocationSize()', () => {
        let numberOfChannels;
        let numberOfFrames;
        let sampleRate;
        let timestamp;

        beforeEach(() => {
            numberOfChannels = 2;
            numberOfFrames = 5;
            sampleRate = 8000;
            timestamp = 1234;
        });

        describe('with AudioData that is not yet closed', () => {
            describe('int8', () => {
                let data;

                beforeEach(() => {
                    data = new Uint8Array(10);
                });

                describe('with u8 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'u8',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should compute the allocationSize for copying the data as u8', () => {
                        expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                    });

                    it('should compute the allocationSize for copying the data as u8 (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(10);
                    });

                    it('should not compute the allocationSize for copying the data as u8-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not ompute the allocationSize for copying the data as s16', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as f32', (done) => {
                        try {
                            audioData.allocationSize({ format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });
                });

                describe('with u8-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'u8-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not compute the allocationSize for copying the data as u8', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as u8-planar', () => {
                        expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                        expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                    });

                    it('should compute the allocationSize for copying the data as u8-planar (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(5);
                        expect(audioData.allocationSize({ planeIndex: 1 })).to.equal(5);
                    });

                    it('should not compute the allocationSize for copying the data as s16', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as f32', (done) => {
                        try {
                            audioData.allocationSize({ format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });
                });
            });

            describe('int16', () => {
                let data;

                beforeEach(() => {
                    data = new Int16Array(10);
                });

                describe('with s16 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's16',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not compute the allocationSize for copying the data as u8', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as u8-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as s16', () => {
                        expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                    });

                    it('should compute the allocationSize for copying the data as s16 (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(20);
                    });

                    it('should not compute the allocationSize for copying the data as s16-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as f32', (done) => {
                        try {
                            audioData.allocationSize({ format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });
                });

                describe('with s16-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's16-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not compute the allocationSize for copying the data as u8', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as u8-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as s16-planar', () => {
                        expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                        expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                    });

                    it('should compute the allocationSize for copying the data as s16-planar (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(10);
                        expect(audioData.allocationSize({ planeIndex: 1 })).to.equal(10);
                    });

                    it('should not compute the allocationSize for copying the data as s32', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as f32', (done) => {
                        try {
                            audioData.allocationSize({ format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });
                });
            });

            describe('int32', () => {
                let data;

                beforeEach(() => {
                    data = new Int32Array(10);
                });

                describe('with s32 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's32',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not compute the allocationSize for copying the data as u8', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as u8-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as s32', () => {
                        expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                    });

                    it('should compute the allocationSize for copying the data as s32 (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(40);
                    });

                    it('should not compute the allocationSize for copying the data as s32-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as f32', (done) => {
                        try {
                            audioData.allocationSize({ format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });
                });

                describe('with s32-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's32-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not compute the allocationSize for copying the data as u8', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as u8-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as s32-planar', () => {
                        expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                    });

                    it('should compute the allocationSize for copying the data as s32-planar (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ planeIndex: 1 })).to.equal(20);
                    });

                    it('should not compute the allocationSize for copying the data as f32', (done) => {
                        try {
                            audioData.allocationSize({ format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });
                });
            });

            describe('float32', () => {
                let data;

                beforeEach(() => {
                    data = new Float32Array(10);
                });

                describe('with f32 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'f32',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not compute the allocationSize for copying the data as u8', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as u8-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32', () => {
                        expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                    });

                    it('should compute the allocationSize for copying the data as f32 (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(40);
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });
                });

                describe('with f32-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'f32-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not compute the allocationSize for copying the data as u8', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as u8-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s16-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as s32-planar', (done) => {
                        try {
                            audioData.allocationSize({ format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not compute the allocationSize for copying the data as f32', (done) => {
                        try {
                            audioData.allocationSize({ format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should compute the allocationSize for copying the data as f32-planar', () => {
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ format: 'f32-planar', planeIndex: 1 })).to.equal(20);
                    });

                    it('should compute the allocationSize for copying the data as f32-planar (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(20);
                        expect(audioData.allocationSize({ planeIndex: 1 })).to.equal(20);
                    });
                });
            });
        });

        describe('with AudioData that is closed', () => {
            let audioData;

            beforeEach(() => {
                audioData = new AudioData({
                    data: new Uint8Array(10),
                    format: 'u8',
                    numberOfChannels,
                    numberOfFrames,
                    sampleRate,
                    timestamp
                });

                audioData.close();
            });

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioData.allocationSize({ format: 'f32-planar', planeIndex: 0 });
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('clone()', () => {
        let audioData;
        let data;
        let format;
        let numberOfChannels;
        let numberOfFrames;
        let sampleRate;
        let timestamp;

        beforeEach(() => {
            numberOfChannels = 2;
            numberOfFrames = 100;
            data = new Float32Array(Array.from({ length: numberOfChannels * numberOfFrames }, () => Math.random()));
            format = 'f32-planar';
            sampleRate = 8000;
            timestamp = 1234;
            audioData = new AudioData({
                data,
                format,
                numberOfChannels,
                numberOfFrames,
                sampleRate,
                timestamp
            });
        });

        describe('with AudioData that is not yet closed', () => {
            it('should return an instance of the AudioData constructor', () => {
                const clonedAudioData = audioData.clone();

                expect(clonedAudioData).to.be.an.instanceOf(AudioData);

                expect(clonedAudioData.allocationSize).to.be.a('function');
                expect(clonedAudioData.clone).to.be.a('function');
                expect(clonedAudioData.close).to.be.a('function');
                expect(clonedAudioData.copyTo).to.be.a('function');
                expect(clonedAudioData.duration).to.equal(audioData.duration);
                expect(clonedAudioData.format).to.equal(audioData.format);
                expect(clonedAudioData.numberOfChannels).to.equal(audioData.numberOfChannels);
                expect(clonedAudioData.numberOfFrames).to.equal(audioData.numberOfFrames);
                expect(clonedAudioData.sampleRate).to.equal(audioData.sampleRate);
                expect(clonedAudioData.timestamp).to.equal(audioData.timestamp);
            });

            it('should copy the data', () => {
                const clonedAudioData = audioData.clone();
                const audioDataDestination = new Float32Array(numberOfFrames);
                const cloneAudioDataDestination = new Float32Array(numberOfFrames);

                for (let planeIndex = 0; planeIndex < numberOfChannels; planeIndex += 1) {
                    audioData.copyTo(audioDataDestination, { planeIndex });
                    clonedAudioData.copyTo(cloneAudioDataDestination, { planeIndex });

                    expect(Array.from(audioDataDestination)).to.deep.equal(Array.from(cloneAudioDataDestination));
                }
            });

            it('should create an independently closable clone', () => {
                const clonedAudioData = audioData.clone();
                const audioDatas = [audioData, clonedAudioData];

                for (const audioData_ of audioDatas) {
                    expect(audioData_.numberOfFrames).to.be.above(0);
                }

                const indexOfAudioDataToCloseAtFirst = Math.floor(Math.random() * audioDatas.length);
                const [audioDataToCloseAtFirst] = audioDatas.splice(indexOfAudioDataToCloseAtFirst, 1);

                audioDataToCloseAtFirst.close();

                expect(audioDataToCloseAtFirst.numberOfFrames).to.equal(0);
                expect(audioDatas[0].numberOfFrames).to.be.above(0);

                audioDatas[0].close();

                expect(audioDatas[0].numberOfFrames).to.equal(0);
            });
        });

        describe('with AudioData that is closed', () => {
            beforeEach(() => {
                audioData.close();
            });

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioData.clone();
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });

    describe('close()', () => {
        let audioData;
        let timestamp;

        beforeEach(() => {
            const numberOfChannels = 2;
            const numberOfFrames = 100;

            timestamp = 1234;
            audioData = new AudioData({
                data: new Float32Array(numberOfChannels * numberOfFrames),
                format: 'f32',
                numberOfChannels,
                numberOfFrames,
                sampleRate: 8000,
                timestamp
            });
        });

        it('should set the duration to 0', () => {
            expect(audioData.duration).not.to.equal(0);

            audioData.close();

            expect(audioData.duration).to.equal(0);
        });

        it('should set the format to null', () => {
            expect(audioData.format).not.to.be.null;

            audioData.close();

            expect(audioData.format).to.be.null;
        });

        it('should set the numberOfChannels to 0', () => {
            expect(audioData.numberOfChannels).not.to.equal(0);

            audioData.close();

            expect(audioData.numberOfChannels).to.equal(0);
        });

        it('should set the numberOfFrames to 0', () => {
            expect(audioData.numberOfFrames).not.to.equal(0);

            audioData.close();

            expect(audioData.numberOfFrames).to.equal(0);
        });

        it('should set the sampleRate to 0', () => {
            expect(audioData.sampleRate).not.to.equal(0);

            audioData.close();

            expect(audioData.sampleRate).to.equal(0);
        });

        it('should not change the timestamp', () => {
            expect(audioData.timestamp).to.equal(timestamp);

            audioData.close();

            expect(audioData.timestamp).to.equal(timestamp);
        });
    });

    describe('copyTo()', () => {
        let numberOfChannels;
        let numberOfFrames;
        let sampleRate;
        let timestamp;

        beforeEach(() => {
            numberOfChannels = 2;
            numberOfFrames = 5;
            sampleRate = 8000;
            timestamp = 1234;
        });

        describe('with AudioData that is not yet closed', () => {
            let testVectorInterleavedPlanes;
            let testVectorPlanarPlanes;

            beforeEach(() => {
                testVectorInterleavedPlanes = [
                    [-1, 1, 0.5, 0, 0],
                    [0, -1, -0.5, 1, 0]
                ];
                testVectorPlanarPlanes = [
                    [-1, 0, 1, -1, 0.5],
                    [-0.5, 0, 1, 0, 0]
                ];
            });

            describe('int8', () => {
                let data;
                let epsilon;

                beforeEach(() => {
                    const INT8_MAX = 0x7f;
                    const INT8_MIN = -INT8_MAX - 1;
                    const UINT8_MAX = 0xff;

                    data = new Uint8Array([
                        0,
                        -INT8_MIN,
                        UINT8_MAX,
                        0,
                        INT8_MAX / 2 + 128,
                        INT8_MIN / 2 + 128,
                        -INT8_MIN,
                        UINT8_MAX,
                        -INT8_MIN,
                        -INT8_MIN
                    ]);
                    epsilon = 1 / (UINT8_MAX - 1);
                });

                describe('with u8 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'u8',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should copy the data as u8 (without specifying it)', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should not copy the data as u8 if the destination is too small', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should not copy the data as u8-planar', (done) => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16', (done) => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16-planar', (done) => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32', (done) => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32-planar', (done) => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as f32', (done) => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorInterleavedPlanes[0][i], epsilon);
                        }

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorInterleavedPlanes[1][i], epsilon);
                        }
                    });
                });

                describe('with u8-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'u8-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not copy the data as u8', (done) => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(0, numberOfFrames));

                        audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(numberOfFrames));
                    });

                    it('should copy the data as u8-planar (without specifying it)', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(0, numberOfFrames));

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(numberOfFrames));
                    });

                    it('should not copy the data as u8-planar if the destination is too small', () => {
                        const destination = new Uint8Array(numberOfFrames - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                        expect(() => audioData.copyTo(destination, { planeIndex: 1 })).to.throw(RangeError);
                    });

                    it('should not copy the data as s16', (done) => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16-planar', (done) => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32', (done) => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32-planar', (done) => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as f32', (done) => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorPlanarPlanes[0][i], epsilon);
                        }

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorPlanarPlanes[1][i], epsilon);
                        }
                    });
                });
            });

            describe('int16', () => {
                let data;
                let epsilon;

                beforeEach(() => {
                    const INT16_MAX = 0x7fff;
                    const INT16_MIN = -INT16_MAX - 1;

                    data = new Int16Array([INT16_MIN, 0, INT16_MAX, INT16_MIN, INT16_MAX / 2, INT16_MIN / 2, 0, INT16_MAX, 0, 0]);
                    epsilon = 1 / (INT16_MAX + 1);
                });

                describe('with s16 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's16',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not copy the data as u8', (done) => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as u8-planar', (done) => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should copy the data as s16 (without specifying it)', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should not copy the data as s16 if the destination is too small', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should not copy the data as s16-planar', (done) => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32', (done) => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32-planar', (done) => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as f32', (done) => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorInterleavedPlanes[0][i], epsilon);
                        }

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorInterleavedPlanes[1][i], epsilon);
                        }
                    });
                });

                describe('with s16-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's16-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not copy the data as u8', (done) => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as u8-planar', (done) => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16', (done) => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(0, numberOfFrames));

                        audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(numberOfFrames));
                    });

                    it('should copy the data as s16-planar (without specifying it)', () => {
                        const destination = new Int16Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(0, numberOfFrames));

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(numberOfFrames));
                    });

                    it('should not copy the data as s16-planar if the destination is too small', () => {
                        const destination = new Int16Array(numberOfFrames - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                        expect(() => audioData.copyTo(destination, { planeIndex: 1 })).to.throw(RangeError);
                    });

                    it('should not copy the data as s32', (done) => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32-planar', (done) => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as f32', (done) => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorPlanarPlanes[0][i], epsilon);
                        }

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        for (let i = 0; i < numberOfFrames; i += 1) {
                            expect(destination[i]).to.be.closeTo(testVectorPlanarPlanes[1][i], epsilon);
                        }
                    });
                });
            });

            describe('int32', () => {
                let data;

                beforeEach(() => {
                    const INT32_MAX = 0x7fffffff;
                    const INT32_MIN = -INT32_MAX - 1;

                    data = new Int32Array([INT32_MIN, 0, INT32_MAX, INT32_MIN, INT32_MAX / 2, INT32_MIN / 2, 0, INT32_MAX, 0, 0]);
                });

                describe('with s32 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's32',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not copy the data as u8', (done) => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as u8-planar', (done) => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16', (done) => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16-planar', (done) => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should copy the data as s32 (without specifying it)', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should not copy the data as s32 if the destination is too small', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should not copy the data as s32-planar', (done) => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as f32', (done) => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorInterleavedPlanes[0]));

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorInterleavedPlanes[1]));
                    });
                });

                describe('with s32-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 's32-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not copy the data as u8', (done) => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as u8-planar', (done) => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16', (done) => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16-planar', (done) => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32', (done) => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(0, numberOfFrames));

                        audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(numberOfFrames));
                    });

                    it('should copy the data as s32-planar (without specifying it)', () => {
                        const destination = new Int32Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(0, numberOfFrames));

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data).slice(numberOfFrames));
                    });

                    it('should not copy the data as s32-planar if the destination is too small', () => {
                        const destination = new Int32Array(numberOfFrames - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                        expect(() => audioData.copyTo(destination, { planeIndex: 1 })).to.throw(RangeError);
                    });

                    it('should not copy the data as f32', (done) => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorPlanarPlanes[0]));

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorPlanarPlanes[1]));
                    });
                });
            });

            describe('float32', () => {
                let data;

                beforeEach(() => {
                    data = new Float32Array([-1, 0, 1, -1, 0.5, -0.5, 0, 1, 0, 0]);
                });

                describe('with f32 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'f32',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not copy the data as u8', (done) => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as u8-planar', (done) => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16', (done) => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16-planar', (done) => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32', (done) => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32-planar', (done) => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should copy the data as f32 (without specifying it)', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(data));
                    });

                    it('should not copy the data as f32 if the destination is too small', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorInterleavedPlanes[0]));

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorInterleavedPlanes[1]));
                    });
                });

                describe('with f32-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data,
                            format: 'f32-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should not copy the data as u8', (done) => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as u8-planar', (done) => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16', (done) => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s16-planar', (done) => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32', (done) => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as s32-planar', (done) => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should not copy the data as f32', (done) => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');

                            done();
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorPlanarPlanes[0]));

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorPlanarPlanes[1]));
                    });

                    it('should copy the data as f32-planar (without specifying it)', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorPlanarPlanes[0]));

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(Array.from(destination)).to.deep.equal(Array.from(testVectorPlanarPlanes[1]));
                    });

                    it('should not copy the data as f32-planar if the destination is too small', () => {
                        const destination = new Float32Array(numberOfFrames - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                        expect(() => audioData.copyTo(destination, { planeIndex: 1 })).to.throw(RangeError);
                    });
                });
            });
        });

        describe('with AudioData that is closed', () => {
            let audioData;
            let destination;

            beforeEach(() => {
                audioData = new AudioData({
                    data: new Uint8Array(10),
                    format: 'u8',
                    numberOfChannels,
                    numberOfFrames,
                    sampleRate,
                    timestamp
                });
                destination = new Float32Array(numberOfFrames);

                audioData.close();
            });

            it('should throw an InvalidStateError', (done) => {
                try {
                    audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });
                } catch (err) {
                    expect(err.code).to.equal(11);
                    expect(err.name).to.equal('InvalidStateError');

                    done();
                }
            });
        });
    });
});
