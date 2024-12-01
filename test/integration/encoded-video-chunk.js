import { EncodedVideoChunk } from '../../src/module';

describe('EncodedVideoChunk', () => {
    describe('constructor()', () => {
        let data;
        let duration;
        let timestamp;
        let type;

        beforeEach(() => {
            data = new Uint8Array([10, 11, 12]);
            duration = 123;
            timestamp = 10;
            type = 'key';
        });

        describe('with valid options', () => {
            it('should return an instance of the EncodedVideoChunk constructor', () => {
                const encodedVideoChunk = new EncodedVideoChunk({
                    data,
                    duration,
                    timestamp,
                    type
                });

                expect(encodedVideoChunk).to.be.an.instanceOf(EncodedVideoChunk);

                expect(encodedVideoChunk.copyTo).to.be.a('function');
                expect(encodedVideoChunk.byteLength).to.equal(data.byteLength);
                expect(encodedVideoChunk.duration).to.equal(duration);
                expect(encodedVideoChunk.timestamp).to.equal(timestamp);
                expect(encodedVideoChunk.type).to.equal(type);
            });

            it('should return an instance with a missing duration property', () => {
                const encodedVideoChunk = new EncodedVideoChunk({
                    data,
                    timestamp,
                    type
                });

                expect(encodedVideoChunk).to.be.an.instanceOf(EncodedVideoChunk);

                expect(encodedVideoChunk.copyTo).to.be.a('function');
                expect(encodedVideoChunk.byteLength).to.equal(data.byteLength);
                expect(encodedVideoChunk.duration).to.be.null;
                expect(encodedVideoChunk.timestamp).to.equal(timestamp);
                expect(encodedVideoChunk.type).to.equal(type);
            });

            it('should detach a transferred ArrayBuffer', () => {
                new EncodedVideoChunk({
                    data,
                    timestamp,
                    transfer: [data.buffer],
                    type
                });

                expect(data.buffer.byteLength).to.equal(0);
            });
        });

        describe('with invalid options', () => {
            describe('with a missing data property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new EncodedVideoChunk({
                                duration,
                                timestamp,
                                type
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with two references to the same ArrayBuffer', () => {
                it('should throw a DataCloneError', (done) => {
                    try {
                        new EncodedVideoChunk({
                            data,
                            duration,
                            timestamp,
                            transfer: [data.buffer, data.buffer],
                            type
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
                        new EncodedVideoChunk({
                            data,
                            duration,
                            timestamp,
                            transfer: [data.buffer],
                            type
                        });
                    } catch (err) {
                        expect(err.code).to.equal(25);
                        expect(err.name).to.equal('DataCloneError');

                        done();
                    }
                });
            });

            describe('with a missing timestamp property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new EncodedVideoChunk({
                                data,
                                duration,
                                type
                            })
                    ).to.throw(TypeError);
                });
            });

            describe('with a missing type property', () => {
                it('should throw a TypeError', () => {
                    expect(
                        () =>
                            new EncodedVideoChunk({
                                data,
                                duration,
                                timestamp
                            })
                    ).to.throw(TypeError);
                });
            });
        });
    });

    describe('copyTo()', () => {
        let data;
        let encodedVideoChunk;

        beforeEach(() => {
            data = new Uint8Array([0, 1, 2]);
            encodedVideoChunk = new EncodedVideoChunk({
                data,
                timestamp: 100,
                type: 'delta'
            });
        });

        describe('with a BufferSource that is too small', () => {
            let destination;

            beforeEach(() => {
                destination = new Uint8Array(data.length - 1);
            });

            it('should throw a TypeError', () => {
                expect(() => encodedVideoChunk.copyTo(destination)).to.throw(TypeError);
            });
        });

        describe('with a BufferSource that is detached', () => {
            let destination;

            beforeEach(() => {
                destination = new Uint8Array(data.length);

                const { port1 } = new MessageChannel();

                port1.postMessage(destination, [destination.buffer]);
                port1.close();
            });

            it('should throw a TypeError', () => {
                expect(() => encodedVideoChunk.copyTo(destination)).to.throw(TypeError);
            });
        });

        describe('with a BufferSource that is not yet detached', () => {
            let destination;

            beforeEach(() => {
                destination = new Uint8Array(data.length);
            });

            it('should copy the data', () => {
                encodedVideoChunk.copyTo(destination);

                expect(destination).to.deep.equal(data);
            });
        });
    });
});
