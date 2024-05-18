import { EncodedAudioChunk } from '../../src/module';

describe('EncodedAudioChunk', () => {
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
            it('should return an instance of the EncodedAudioChunk constructor', () => {
                const encodedAudioChunk = new EncodedAudioChunk({
                    data,
                    duration,
                    timestamp,
                    type
                });

                expect(encodedAudioChunk).to.be.an.instanceOf(EncodedAudioChunk);

                expect(encodedAudioChunk.copyTo).to.be.a('function');
                expect(encodedAudioChunk.byteLength).to.equal(data.byteLength);
                expect(encodedAudioChunk.duration).to.equal(duration);
                expect(encodedAudioChunk.timestamp).to.equal(timestamp);
                expect(encodedAudioChunk.type).to.equal(type);
            });

            it('should return an instance with a missing duration property', () => {
                const encodedAudioChunk = new EncodedAudioChunk({
                    data,
                    timestamp,
                    type
                });

                expect(encodedAudioChunk).to.be.an.instanceOf(EncodedAudioChunk);

                expect(encodedAudioChunk.copyTo).to.be.a('function');
                expect(encodedAudioChunk.byteLength).to.equal(data.byteLength);
                expect(encodedAudioChunk.duration).to.be.null;
                expect(encodedAudioChunk.timestamp).to.equal(timestamp);
                expect(encodedAudioChunk.type).to.equal(type);
            });

            it('should detach a transferred ArrayBuffer', () => {
                new EncodedAudioChunk({
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
                            new EncodedAudioChunk({
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
                        new EncodedAudioChunk({
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
                        new EncodedAudioChunk({
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
                            new EncodedAudioChunk({
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
                            new EncodedAudioChunk({
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
        let encodedAudioChunk;

        beforeEach(() => {
            data = new Uint8Array([0, 1, 2]);
            encodedAudioChunk = new EncodedAudioChunk({
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
                expect(() => encodedAudioChunk.copyTo(destination)).to.throw(TypeError);
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
                expect(() => encodedAudioChunk.copyTo(destination)).to.throw(TypeError);
            });
        });

        describe('with a BufferSource that is not yet detached', () => {
            let destination;

            beforeEach(() => {
                destination = new Uint8Array(data.length);
            });

            it('should copy the data', () => {
                encodedAudioChunk.copyTo(destination);

                expect(destination).to.deep.equal(data);
            });
        });
    });
});
