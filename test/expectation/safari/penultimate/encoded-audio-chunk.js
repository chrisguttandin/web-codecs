import { describe, expect, it } from 'vitest';

describe('EncodedAudioChunk', () => {
    // bug #4

    it('should not be implemented', () => {
        expect(window.EncodedAudioChunk).to.be.undefined;
    });
});
