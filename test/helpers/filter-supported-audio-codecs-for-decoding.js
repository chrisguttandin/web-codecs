export const filterSupportedAudioCodecsForDecoding = (knownAudioCodecs, userAgent) =>
    /Chrome\/134/.test(userAgent)
        ? knownAudioCodecs.filter((knownAudioCodec) =>
              [
                  'alaw',
                  'flac',
                  'mp3',
                  'mp4a.40.02',
                  'mp4a.40.05',
                  'mp4a.40.2',
                  'mp4a.40.29',
                  'mp4a.40.5',
                  'mp4a.67',
                  'mp4a.69',
                  'mp4a.6B',
                  'opus',
                  'pcm-f32',
                  'pcm-s16',
                  'pcm-s24',
                  'pcm-s32',
                  'pcm-u8',
                  'ulaw',
                  'vorbis'
              ].includes(knownAudioCodec)
          )
        : /Chrome/.test(userAgent)
          ? knownAudioCodecs.filter((knownAudioCodec) =>
                [
                    'alaw',
                    'flac',
                    'mp3',
                    'mp4a.40.02',
                    'mp4a.40.05',
                    'mp4a.40.2',
                    'mp4a.40.29',
                    'mp4a.40.5',
                    'mp4a.67',
                    'mp4a.69',
                    'mp4a.6B',
                    'opus',
                    'ulaw',
                    'vorbis'
                ].includes(knownAudioCodec)
            )
          : /Firefox/.test(userAgent)
            ? knownAudioCodecs.filter((knownAudioCodec) =>
                  [
                      'alaw',
                      'flac',
                      'mp3',
                      'mp4a.40.02',
                      'mp4a.40.05',
                      'mp4a.40.2',
                      'mp4a.40.29',
                      'mp4a.40.5',
                      'mp4a.67',
                      'opus',
                      'pcm-f32',
                      'pcm-s16',
                      'pcm-s24',
                      'pcm-s32',
                      'pcm-u8',
                      'ulaw',
                      'vorbis'
                  ].includes(knownAudioCodec)
              )
            : [];
