export const convertInt16ToInt32 = (value: number) => Math.min(Math.fround(value * (value < 0 ? 65536 : 65538)), 2147483647);
