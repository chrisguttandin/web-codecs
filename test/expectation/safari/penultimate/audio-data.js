import { describe, expect, it } from 'vitest';

describe('AudioData', () => {
    // bug #1

    it('should not be implemented', () => {
        expect(window.AudioData).to.be.undefined;
    });
});
