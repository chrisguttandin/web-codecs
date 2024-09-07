describe('AudioDecoder', () => {
    // bug #5

    it('should not be implemented', () => {
        expect(window.AudioDecoder).to.be.undefined;
    });
});
