describe('EncodedAudioChunk', () => {
    describe('with multiple references to the same ArrayBuffer', () => {
        // bug #16

        let data;

        beforeEach(() => {
            data = new ArrayBuffer(1);
        });

        it('should not throw any error', () => {
            // eslint-disable-next-line no-undef
            new EncodedAudioChunk({
                data,
                timestamp: 0,
                transfer: [data, data],
                type: 'key'
            });
        });
    });

    describe('with a reference to a detached ArrayBuffer', () => {
        // bug #17

        let data;

        beforeEach(() => {
            data = new ArrayBuffer(1);

            const { port1 } = new MessageChannel();

            port1.postMessage(data, [data]);
            port1.close();
        });

        it('should not throw any error', () => {
            // eslint-disable-next-line no-undef
            new EncodedAudioChunk({
                data,
                timestamp: 0,
                transfer: [data],
                type: 'key'
            });
        });
    });

    describe('with an ArrayBuffer meant to be transfered', () => {
        // bug #18

        let data;

        beforeEach(() => {
            data = new ArrayBuffer(1);
        });

        it('should not detach an ArrayBuffer', () => {
            // eslint-disable-next-line no-undef
            new EncodedAudioChunk({
                data,
                timestamp: 0,
                transfer: [data],
                type: 'key'
            });

            expect(data.byteLength).to.equal(1);
        });
    });
});
