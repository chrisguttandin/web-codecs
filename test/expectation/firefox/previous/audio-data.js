describe('AudioData', () => {
    describe('with multiple references to the same ArrayBuffer', () => {
        // bug #14

        let data;

        beforeEach(() => {
            data = new ArrayBuffer(1);
        });

        it('should not throw any error', () => {
            // eslint-disable-next-line no-undef
            new AudioData({
                data,
                format: 'u8',
                numberOfChannels: 1,
                numberOfFrames: 1,
                sampleRate: 48000,
                timestamp: 0,
                transfer: [data, data]
            });
        });
    });

    describe('with an ArrayBuffer meant to be transfered', () => {
        // bug #15

        let data;

        beforeEach(() => {
            data = new ArrayBuffer(1);
        });

        it('should not detach an ArrayBuffer', () => {
            // eslint-disable-next-line no-undef
            new AudioData({
                data,
                format: 'u8',
                numberOfChannels: 1,
                numberOfFrames: 1,
                sampleRate: 48000,
                timestamp: 0,
                transfer: [data]
            });

            expect(data.byteLength).to.equal(1);
        });
    });
});
