import { AudioData } from '../../src/module';
import { convertFloat32ToInt16 } from '../../src/functions/convert-float32-to-int16';
import { convertFloat32ToInt32 } from '../../src/functions/convert-float32-to-int32';
import { convertFloat32ToUint8 } from '../../src/functions/convert-float32-to-uint8';
import { convertInt16ToFloat32 } from '../../src/functions/convert-int16-to-float32';
import { convertInt16ToInt32 } from '../../src/functions/convert-int16-to-int32';
import { convertInt16ToUint8 } from '../../src/functions/convert-int16-to-uint8';
import { convertInt32ToFloat32 } from '../../src/functions/convert-int32-to-float32';
import { convertInt32ToInt16 } from '../../src/functions/convert-int32-to-int16';
import { convertInt32ToUint8 } from '../../src/functions/convert-int32-to-uint8';
import { convertUint8ToFloat32 } from '../../src/functions/convert-uint8-to-float32';
import { convertUint8ToInt16 } from '../../src/functions/convert-uint8-to-int16';
import { convertUint8ToInt32 } from '../../src/functions/convert-uint8-to-int32';
import { deinterleave } from '../helpers/deinterleave';
import { extractPlanes } from '../helpers/extract-planes';

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

            it('should detach a transferred ArrayBuffer', () => {
                new AudioData({
                    data,
                    format,
                    numberOfChannels,
                    numberOfFrames,
                    sampleRate,
                    timestamp,
                    transfer: [data.buffer]
                });

                expect(data.buffer.byteLength).to.equal(0);
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

            describe('with two references to the same ArrayBuffer', () => {
                it('should throw a DataCloneError', (done) => {
                    try {
                        new AudioData({
                            data,
                            format,
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp,
                            transfer: [data.buffer, data.buffer]
                        });
                    } catch (err) {
                        expect(err.code).to.equal(25);
                        expect(err.name).to.equal('DataCloneError');

                        done();
                    }
                });
            });

            describe('with a reference to a detached ArrayBuffer', () => {
                beforeEach(() => {
                    const { port1 } = new MessageChannel();

                    port1.postMessage(data, [data.buffer]);
                    port1.close();
                });

                it('should throw a DataCloneError', (done) => {
                    try {
                        new AudioData({
                            data,
                            format,
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp,
                            transfer: [data.buffer]
                        });
                    } catch (err) {
                        expect(err.code).to.equal(25);
                        expect(err.name).to.equal('DataCloneError');

                        done();
                    }
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

            describe('with a numberOfChannels of zero', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels: 0,
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

            describe('with a numberOfFrames of zero', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new AudioData({
                                data,
                                format,
                                numberOfChannels,
                                numberOfFrames: 0,
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

                    it('should possibly compute the allocationSize for copying the data as u8-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as f32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as u8', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as s16', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as f32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as u8', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as u8-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should compute the allocationSize for copying the data as s16', () => {
                        expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                    });

                    it('should compute the allocationSize for copying the data as s16 (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(20);
                    });

                    it('should possibly compute the allocationSize for copying the data as s16-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as f32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as u8', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as u8-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as s32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as f32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as u8', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as u8-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should compute the allocationSize for copying the data as s32', () => {
                        expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                    });

                    it('should compute the allocationSize for copying the data as s32 (without specifying it)', () => {
                        expect(audioData.allocationSize({ planeIndex: 0 })).to.equal(40);
                    });

                    it('should possibly compute the allocationSize for copying the data as s32-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as f32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as u8', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as u8-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as f32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as u8', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as u8-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    it('should possibly compute the allocationSize for copying the data as u8', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8', planeIndex: 0 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as u8-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 0 })).to.equal(5);
                            expect(audioData.allocationSize({ format: 'u8-planar', planeIndex: 1 })).to.equal(5);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16', planeIndex: 0 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s16-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 0 })).to.equal(10);
                            expect(audioData.allocationSize({ format: 's16-planar', planeIndex: 1 })).to.equal(10);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as s32-planar', () => {
                        try {
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 0 })).to.equal(20);
                            expect(audioData.allocationSize({ format: 's32-planar', planeIndex: 1 })).to.equal(20);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly compute the allocationSize for copying the data as f32', () => {
                        try {
                            expect(audioData.allocationSize({ format: 'f32', planeIndex: 0 })).to.equal(40);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
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

                    expect(audioDataDestination).to.deep.equal(cloneAudioDataDestination);
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
            describe('int8', () => {
                let f32InterleavedData;
                let f32Planes;
                let u8InterleavedData;
                let u8Planes;
                let s16InterleavedData;
                let s16Planes;
                let s32InterleavedData;
                let s32Planes;

                beforeEach(() => {
                    u8InterleavedData = new Uint8Array([0, 128, 255, ...Array.from({ length: 7 }, () => Math.floor(Math.random() * 256))]);
                    f32InterleavedData = new Float32Array(Array.from(u8InterleavedData).map((value) => convertUint8ToFloat32(value)));
                    f32Planes = extractPlanes(f32InterleavedData);
                    s16InterleavedData = new Int16Array(Array.from(u8InterleavedData).map((value) => convertUint8ToInt16(value)));
                    s16Planes = extractPlanes(s16InterleavedData);
                    s32InterleavedData = new Int32Array(Array.from(u8InterleavedData).map((value) => convertUint8ToInt32(value)));
                    s32Planes = extractPlanes(s32InterleavedData);
                    u8Planes = extractPlanes(u8InterleavedData);
                });

                describe('with u8 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: u8InterleavedData,
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

                        expect(destination).to.deep.equal(u8InterleavedData);
                    });

                    it('should copy the data as u8 (without specifying it)', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(u8InterleavedData);
                    });

                    it('should not copy the data as u8 if the destination is too small', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should possibly copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8Planes[0]);

                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(u8Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16Planes[0]);

                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s16Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32Planes[0]);

                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s32Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                            expect(destination).to.deep.equal(f32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });
                });

                describe('with u8-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: new Uint8Array(deinterleave(u8InterleavedData)),
                            format: 'u8-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should possibly copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(u8Planes[0]);

                        audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(u8Planes[1]);
                    });

                    it('should copy the data as u8-planar (without specifying it)', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(u8Planes[0]);

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(destination).to.deep.equal(u8Planes[1]);
                    });

                    it('should not copy the data as u8-planar if the destination is too small', () => {
                        const destination = new Uint8Array(numberOfFrames - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                        expect(() => audioData.copyTo(destination, { planeIndex: 1 })).to.throw(RangeError);
                    });

                    it('should possibly copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16Planes[0]);

                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s16Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32Planes[0]);

                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s32Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                            expect(destination).to.deep.equal(f32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });
                });
            });

            describe('int16', () => {
                let f32InterleavedData;
                let f32Planes;
                let u8InterleavedData;
                let u8Planes;
                let s16InterleavedData;
                let s16Planes;
                let s32InterleavedData;
                let s32Planes;

                beforeEach(() => {
                    s16InterleavedData = new Int16Array([
                        -32768,
                        0,
                        32767,
                        ...Array.from({ length: 7 }, () => Math.floor(Math.random() * 65536) - 32768)
                    ]);
                    f32InterleavedData = new Float32Array(Array.from(s16InterleavedData).map((value) => convertInt16ToFloat32(value)));
                    f32Planes = extractPlanes(f32InterleavedData);
                    s16Planes = extractPlanes(s16InterleavedData);
                    s32InterleavedData = new Int32Array(Array.from(s16InterleavedData).map((value) => convertInt16ToInt32(value)));
                    s32Planes = extractPlanes(s32InterleavedData);
                    u8InterleavedData = new Uint8Array(Array.from(s16InterleavedData).map((value) => convertInt16ToUint8(value)));
                    u8Planes = extractPlanes(u8InterleavedData);
                });

                describe('with s16 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: s16InterleavedData,
                            format: 's16',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should possibly copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8Planes[0]);

                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(u8Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                        expect(destination).to.deep.equal(s16InterleavedData);
                    });

                    it('should copy the data as s16 (without specifying it)', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(s16InterleavedData);
                    });

                    it('should not copy the data as s16 if the destination is too small', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should possibly copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16Planes[0]);

                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s16Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32Planes[0]);

                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s32Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                            expect(destination).to.deep.equal(f32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });
                });

                describe('with s16-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: new Int16Array(deinterleave(s16InterleavedData)),
                            format: 's16-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should possibly copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8Planes[0]);

                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(u8Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(s16Planes[0]);

                        audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(s16Planes[1]);
                    });

                    it('should copy the data as s16-planar (without specifying it)', () => {
                        const destination = new Int16Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(s16Planes[0]);

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(destination).to.deep.equal(s16Planes[1]);
                    });

                    it('should not copy the data as s16-planar if the destination is too small', () => {
                        const destination = new Int16Array(numberOfFrames - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                        expect(() => audioData.copyTo(destination, { planeIndex: 1 })).to.throw(RangeError);
                    });

                    it('should possibly copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32Planes[0]);

                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s32Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                            expect(destination).to.deep.equal(f32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });
                });
            });

            describe('int32', () => {
                let f32InterleavedData;
                let f32Planes;
                let u8InterleavedData;
                let u8Planes;
                let s16InterleavedData;
                let s16Planes;
                let s32InterleavedData;
                let s32Planes;

                beforeEach(() => {
                    s32InterleavedData = new Int32Array([
                        -2147483648,
                        0,
                        2147483647,
                        ...Array.from({ length: 7 }, () => Math.floor(Math.random() * 4294967296) - 2147483648)
                    ]);
                    f32InterleavedData = new Float32Array(Array.from(s32InterleavedData).map((value) => convertInt32ToFloat32(value)));
                    f32Planes = extractPlanes(f32InterleavedData);
                    s16InterleavedData = new Int16Array(Array.from(s32InterleavedData).map((value) => convertInt32ToInt16(value)));
                    s16Planes = extractPlanes(s16InterleavedData);
                    s32Planes = extractPlanes(s32InterleavedData);
                    u8InterleavedData = new Uint8Array(Array.from(s32InterleavedData).map((value) => convertInt32ToUint8(value)));
                    u8Planes = extractPlanes(u8InterleavedData);
                });

                describe('with s32 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: s32InterleavedData,
                            format: 's32',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should possibly copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8Planes[0]);

                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(u8Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16Planes[0]);

                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s16Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                        expect(destination).to.deep.equal(s32InterleavedData);
                    });

                    it('should copy the data as s32 (without specifying it)', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(s32InterleavedData);
                    });

                    it('should not copy the data as s32 if the destination is too small', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should possibly copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32Planes[0]);

                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s32Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                            expect(destination).to.deep.equal(f32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });
                });

                describe('with s32-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: new Int32Array(deinterleave(s32InterleavedData)),
                            format: 's32-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should possibly copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8Planes[0]);

                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(u8Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16Planes[0]);

                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s16Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(s32Planes[0]);

                        audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(s32Planes[1]);
                    });

                    it('should copy the data as s32-planar (without specifying it)', () => {
                        const destination = new Int32Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(s32Planes[0]);

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(destination).to.deep.equal(s32Planes[1]);
                    });

                    it('should not copy the data as s32-planar if the destination is too small', () => {
                        const destination = new Int32Array(numberOfFrames - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                        expect(() => audioData.copyTo(destination, { planeIndex: 1 })).to.throw(RangeError);
                    });

                    it('should possibly copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                            expect(destination).to.deep.equal(f32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });
                });
            });

            describe('float32', () => {
                let f32InterleavedData;
                let f32Planes;
                let u8InterleavedData;
                let u8Planes;
                let s16InterleavedData;
                let s16Planes;
                let s32InterleavedData;
                let s32Planes;

                beforeEach(() => {
                    f32InterleavedData = new Float32Array([-1, 0, 1, ...Array.from({ length: 7 }, () => Math.random() * 2 - 1)]);
                    f32Planes = extractPlanes(f32InterleavedData);
                    s16InterleavedData = new Int16Array(Array.from(f32InterleavedData).map((value) => convertFloat32ToInt16(value)));
                    s16Planes = extractPlanes(s16InterleavedData);
                    s32InterleavedData = new Int32Array(Array.from(f32InterleavedData).map((value) => convertFloat32ToInt32(value)));
                    s32Planes = extractPlanes(s32InterleavedData);
                    u8InterleavedData = new Uint8Array(Array.from(f32InterleavedData).map((value) => convertFloat32ToUint8(value)));
                    u8Planes = extractPlanes(u8InterleavedData);
                });

                describe('with f32 data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: f32InterleavedData,
                            format: 'f32',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should possibly copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8Planes[0]);

                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(u8Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16Planes[0]);

                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s16Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32Planes[0]);

                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s32Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32InterleavedData);
                    });

                    it('should copy the data as f32 (without specifying it)', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(f32InterleavedData);
                    });

                    it('should not copy the data as f32 if the destination is too small', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels - 1);

                        expect(() => audioData.copyTo(destination, { planeIndex: 0 })).to.throw(RangeError);
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });
                });

                describe('with f32-planar data', () => {
                    let audioData;

                    beforeEach(() => {
                        audioData = new AudioData({
                            data: new Float32Array(deinterleave(f32InterleavedData)),
                            format: 'f32-planar',
                            numberOfChannels,
                            numberOfFrames,
                            sampleRate,
                            timestamp
                        });
                    });

                    it('should possibly copy the data as u8', () => {
                        const destination = new Uint8Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'u8', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as u8-planar', () => {
                        const destination = new Uint8Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(u8Planes[0]);

                            audioData.copyTo(destination, { format: 'u8-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(u8Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16', () => {
                        const destination = new Int16Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's16', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s16-planar', () => {
                        const destination = new Int16Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s16Planes[0]);

                            audioData.copyTo(destination, { format: 's16-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s16Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32', () => {
                        const destination = new Int32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 's32', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as s32-planar', () => {
                        const destination = new Int32Array(numberOfFrames);

                        try {
                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 0 });

                            expect(destination).to.deep.equal(s32Planes[0]);

                            audioData.copyTo(destination, { format: 's32-planar', planeIndex: 1 });

                            expect(destination).to.deep.equal(s32Planes[1]);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should possibly copy the data as f32', () => {
                        const destination = new Float32Array(numberOfFrames * numberOfChannels);

                        try {
                            audioData.copyTo(destination, { format: 'f32', planeIndex: 0 });

                            expect(destination).to.deep.equal(f32InterleavedData);
                        } catch (err) {
                            expect(err.code).to.equal(9);
                            expect(err.name).to.equal('NotSupportedError');
                        }
                    });

                    it('should copy the data as f32-planar', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { format: 'f32-planar', planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
                    });

                    it('should copy the data as f32-planar (without specifying it)', () => {
                        const destination = new Float32Array(numberOfFrames);

                        audioData.copyTo(destination, { planeIndex: 0 });

                        expect(destination).to.deep.equal(f32Planes[0]);

                        audioData.copyTo(destination, { planeIndex: 1 });

                        expect(destination).to.deep.equal(f32Planes[1]);
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
