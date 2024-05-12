import { AudioData, AudioDecoder, EncodedAudioChunk } from '../../src/module';

describe('module', () => {
    it('should export the AudioData constructor', () => {
        expect(AudioData).to.be.a('function');
    });

    it('should export the AudioDecoder constructor', () => {
        expect(AudioDecoder).to.be.a('function');
    });

    it('should export the EncodedAudioChunk constructor', () => {
        expect(EncodedAudioChunk).to.be.a('function');
    });
});
