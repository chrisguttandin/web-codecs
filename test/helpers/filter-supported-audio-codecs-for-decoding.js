export const filterSupportedAudioCodecsForDecoding = (knownAudioCodecs, userAgent) =>
    /Chrome/.test(userAgent)
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
        : [];
