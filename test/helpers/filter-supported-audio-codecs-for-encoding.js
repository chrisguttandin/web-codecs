export const filterSupportedAudioCodecsForEncoding = (knownAudioCodecs, userAgent) =>
    /Chrome/.test(userAgent)
        ? knownAudioCodecs.filter((knownAudioCodec) =>
              ['mp4a.40.02', 'mp4a.40.05', 'mp4a.40.2', 'mp4a.40.29', 'mp4a.40.5', 'mp4a.67', 'opus'].includes(knownAudioCodec)
          )
        : /Firefox/.test(userAgent)
          ? knownAudioCodecs.filter((knownAudioCodec) => ['opus', 'vorbis'].includes(knownAudioCodec))
          : [];
