export const convertFloat32ToInt32 = (value: number) => Math.fround(value * (value < 0 ? 2147483648 : 2147483647));
