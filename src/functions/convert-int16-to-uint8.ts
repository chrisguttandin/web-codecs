export const convertInt16ToUint8 = (value: number) => 128 + value / (value < 0 ? 32768 / 128 : 32767 / 127);
