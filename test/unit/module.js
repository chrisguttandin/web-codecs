import { AudioData } from '../../src/module';

describe('module', () => {
    it('should export the AudioData constructor', () => {
        expect(AudioData).to.be.a('function');
    });
});
