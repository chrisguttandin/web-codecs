export const convertInt32ToFloat32 = (value: number) => value * Math.fround(1 / (value < 0 ? 2147483648 : 2147483647));
