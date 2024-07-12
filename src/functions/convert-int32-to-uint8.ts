export const convertInt32ToUint8 = (value: number) => 128 + value / (value < 0 ? 2147483648 / 128 : 2147483647 / 127);
