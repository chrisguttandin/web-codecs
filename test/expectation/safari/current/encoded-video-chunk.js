describe('EncodedVideoChunk', () => {
    describe('with multiple references to the same ArrayBuffer', () => {
        // bug #16

        let data;

        beforeEach(() => {
            data = new ArrayBuffer(1);
        });

        it('should not throw any error', () => {
            // eslint-disable-next-line no-undef
            new EncodedVideoChunk({
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
            new EncodedVideoChunk({
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
            new EncodedVideoChunk({
                data,
                timestamp: 0,
                transfer: [data],
                type: 'key'
            });

            expect(data.byteLength).to.equal(1);
        });
    });

    describe('without a timestamp property', () => {
        // bug #24

        it('should allow to create an EncodedVideoChunk without a timestamp', () => {
            // eslint-disable-next-line no-undef
            const encodedVideoChunk = new EncodedVideoChunk({ data: new ArrayBuffer(), type: 'key' });

            expect(encodedVideoChunk.timestamp).to.equal(0);
        });
    });
});
