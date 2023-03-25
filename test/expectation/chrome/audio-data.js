describe('AudioData', () => {
    // bug #2

    it('should throw a  be implemented', (done) => {
        try {
            // eslint-disable-next-line no-undef
            new AudioData({
                data: new Float32Array(200),
                format: 'f32-planar',
                numberOfChannels: 2,
                numberOfFrames: 100,
                sampleRate: 0,
                timestamp: 1234
            });
        } catch (err) {
            expect(err.code).to.equal(9);
            expect(err.name).to.equal('NotSupportedError');

            done();
        }
    });
});
