export const extractPlanes = (interleavedData) => [
    interleavedData.filter((_, index) => index % 2 === 0),
    interleavedData.filter((_, index) => index % 2 === 1)
];
