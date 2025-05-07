describe('VideoFrame', () => {
    let videoFrame;

    beforeEach(() => {
        // eslint-disable-next-line no-undef
        videoFrame = new VideoFrame(document.createElement('canvas'), { timestamp: 0 });
    });

    describe('flip', () => {
        // bug #22

        it('should not be implemented', () => {
            expect(videoFrame.flip).to.be.undefined;
        });
    });

    describe('rotation', () => {
        // bug #23

        it('should not be implemented', () => {
            expect(videoFrame.rotation).to.be.undefined;
        });
    });
});
