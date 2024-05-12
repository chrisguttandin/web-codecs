import { KNOWN_AUDIO_CODECS } from '../constants/known-audio-codecs';

export const createIsKnownAudioCodec = (knownAudioCodecs: typeof KNOWN_AUDIO_CODECS) => (codec: string) => knownAudioCodecs.includes(codec);
