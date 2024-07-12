export const convertFloat32ToInt16 = (value: number) => Math.fround(value * (value < 0 ? 32768 : 32767));
