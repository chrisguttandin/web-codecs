export const convertFloat32ToInt32 = (value: number) => Math.min(Math.fround(value * (value < 0 ? 2147483648 : 2147483647)), 2147483647);
