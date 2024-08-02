import { INativeAudioEncoderConfig } from '../interfaces';

export type TNativeAudioEncoderConfig =
    | INativeAudioEncoderConfig
    | (INativeAudioEncoderConfig & {
          aac: { format: 'aac' | 'adts' };
          codec: 'mp4a.40.02' | 'mp4a.40.05' | 'mp4a.40.2' | 'mp4a.40.29' | 'mp4a.40.5' | 'mp4a.67';
      })
    | (INativeAudioEncoderConfig & { codec: 'flac'; flac: { blockSize: number; compressLevel: number } })
    | (INativeAudioEncoderConfig & {
          codec: 'opus';
          opus: {
              application: 'audio' | 'lowdelay' | 'voip';
              complexity: number;
              format: 'ogg' | 'opus';
              frameDuration: number;
              packetlossperc: number;
              signal: 'auto' | 'music' | 'voice';
              usedtx: boolean;
              useinbandfec: boolean;
          };
      });
