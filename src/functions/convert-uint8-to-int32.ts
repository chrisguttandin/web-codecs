export const convertUint8ToInt32 = (value: number) =>
    Math.min(2147483647, Math.fround((value - 128) * (value < 128 ? 16777216 : Math.fround(2147483647 / 127))));
