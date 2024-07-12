export const convertUint8ToInt16 = (value: number) =>
    value < 128 ? (value - 128) * 256 : Math.fround(Math.fround((value - 128) / 127) * 32767);
