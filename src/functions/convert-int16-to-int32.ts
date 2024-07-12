export const convertInt16ToInt32 = (value: number) => Math.fround(value * (value < 0 ? 65536 : 65538));
