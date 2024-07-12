export const convertUint8ToFloat32 = (value: number) => (value - 128) * Math.fround(1 / (value < 128 ? 128 : 127));
