describe('EncodedAudioChunk', () => {
    describe('constructor', () => {
        describe('with a missing timestamp property', () => {
            // bug #28

            it('should not throw any error', () => {
                new EncodedAudioChunk({
                    data: new Uint8Array([10, 11, 12]),
                    duration: 123,
                    type: 'key'
                });
            });
        });
    });
});
