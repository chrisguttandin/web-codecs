export const convertInt16ToFloat32 = (value: number) => value * Math.fround(1 / (value < 0 ? 32768 : 32767));
