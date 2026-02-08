import { describe, expect, it } from 'vitest';

describe('AudioEncoder', () => {
    // bug #6

    it('should not be implemented', () => {
        expect(window.AudioEncoder).to.be.undefined;
    });
});
