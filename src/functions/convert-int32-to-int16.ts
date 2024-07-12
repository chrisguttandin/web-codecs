export const convertInt32ToInt16 = (value: number) => value / (value < 0 ? 65536 : 2147483647 / 32767);
