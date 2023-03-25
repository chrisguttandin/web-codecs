import { computeCopyElementCount } from '../../../src/functions/compute-copy-element-count';

describe('computeCopyElementCount()', () => {
    let frameCount;
    let numberOfChannels;
    let numberOfFrames;

    beforeEach(() => {
        frameCount = 10;
        numberOfChannels = 2;
        numberOfFrames = 20;
    });

    describe('with u8 as format', () => {
        let format;

        beforeEach(() => {
            format = 'u8';
        });

        describe('with an impossible frameOffset', () => {
            let frameOffset;

            beforeEach(() => {
                frameOffset = 20;
            });

            describe('with a planeIndex of 0', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 0;
                });

                it('should throw a RangeError', () => {
                    expect(() =>
                        computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)
                    ).to.throw(RangeError);
                });
            });

            describe('with a planeIndex of 1', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 1;
                });

                it('should throw a RangeError', () => {
                    expect(() =>
                        computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)
                    ).to.throw(RangeError);
                });
            });
        });

        describe('with a possible frameOffset', () => {
            let frameOffset;

            beforeEach(() => {
                frameOffset = 5;
            });

            describe('with a planeIndex of 0', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 0;
                });

                it('should compute the elementCount', () => {
                    expect(computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)).to.equal(
                        20
                    );
                });
            });

            describe('with a planeIndex of 1', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 1;
                });

                it('should throw a RangeError', () => {
                    expect(() =>
                        computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)
                    ).to.throw(RangeError);
                });
            });
        });
    });

    describe('with u8-planar as format', () => {
        let format;

        beforeEach(() => {
            format = 'u8-planar';
        });

        describe('with an impossible frameOffset', () => {
            let frameOffset;

            beforeEach(() => {
                frameOffset = 20;
            });

            describe('with a planeIndex of 0', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 0;
                });

                it('should throw a RangeError', () => {
                    expect(() =>
                        computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)
                    ).to.throw(RangeError);
                });
            });

            describe('with a planeIndex of 1', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 1;
                });

                it('should throw a RangeError', () => {
                    expect(() =>
                        computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)
                    ).to.throw(RangeError);
                });
            });

            describe('with a planeIndex of 2', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 2;
                });

                it('should throw a RangeError', () => {
                    expect(() =>
                        computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)
                    ).to.throw(RangeError);
                });
            });
        });

        describe('with a possible frameOffset', () => {
            let frameOffset;

            beforeEach(() => {
                frameOffset = 5;
            });

            describe('with a planeIndex of 0', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 0;
                });

                it('should compute the elementCount', () => {
                    expect(computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)).to.equal(
                        10
                    );
                });
            });

            describe('with a planeIndex of 1', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 1;
                });

                it('should compute the elementCount', () => {
                    expect(computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)).to.equal(
                        10
                    );
                });
            });

            describe('with a planeIndex of 2', () => {
                let planeIndex;

                beforeEach(() => {
                    planeIndex = 2;
                });

                it('should throw a RangeError', () => {
                    expect(() =>
                        computeCopyElementCount(format, frameCount, frameOffset, numberOfChannels, numberOfFrames, planeIndex)
                    ).to.throw(RangeError);
                });
            });
        });
    });
});
