export const convertFloat32ToUint8 = (value: number) => 128 + value * (value < 0 ? 128 : 127);
