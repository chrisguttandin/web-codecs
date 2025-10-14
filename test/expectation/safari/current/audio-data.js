describe('AudioData', () => {
    describe('close()', () => {
        let audioData;

        beforeEach(() => {
            const numberOfChannels = 2;
            const numberOfFrames = 100;

            // eslint-disable-next-line no-undef
            audioData = new AudioData({
                data: new Float32Array(numberOfChannels * numberOfFrames),
                format: 'f32',
                numberOfChannels,
                numberOfFrames,
                sampleRate: 8000,
                timestamp: 1234
            });
        });

        // bug #26

        it('should set the duration to null', () => {
            audioData.close();

            expect(audioData.duration).to.be.null;
        });

        // bug #27

        it('should set the timestamp to 0', () => {
            audioData.close();

            expect(audioData.timestamp).to.equal(0);
        });
    });
});
