describe('AudioData', () => {
    describe('with a sampleRate below zero', () => {
        // bug #2

        it('should throw a NotSupportedError', (done) => {
            try {
                // eslint-disable-next-line no-undef
                new AudioData({
                    data: new Float32Array(200),
                    format: 'f32-planar',
                    numberOfChannels: 2,
                    numberOfFrames: 100,
                    sampleRate: -10,
                    timestamp: 1234
                });
            } catch (err) {
                expect(err.code).to.equal(9);
                expect(err.name).to.equal('NotSupportedError');

                done();
            }
        });
    });

    describe('with a reference to a detached ArrayBuffer', () => {
        // bug #3

        let data;

        beforeEach(() => {
            data = new Float32Array(200);

            const { port1 } = new MessageChannel();

            port1.postMessage(data, [data.buffer]);
            port1.close();
        });

        it('should throw a TypeError', () => {
            expect(
                () =>
                    // eslint-disable-next-line no-undef
                    new AudioData({
                        data,
                        format: 'f32-planar',
                        numberOfChannels: 2,
                        numberOfFrames: 100,
                        sampleRate: 48000,
                        timestamp: 1234,
                        transfer: [data.buffer]
                    })
            ).to.throw(TypeError);
        });
    });
});
