export const computeDelta = (expectedDestinationValue, sourceFormat, destinationFormat) => {
    if (navigator.userAgent.includes('Firefox')) {
        if (sourceFormat === 'f32') {
            if (destinationFormat === 's16') {
                return 1;
            }

            if (destinationFormat === 's32') {
                return 2 ** 8;
            }

            if (destinationFormat === 'u8') {
                return 1;
            }
        }

        if (sourceFormat === 's16') {
            if (destinationFormat === 'f32') {
                return 1 / 2 ** 8;
            }

            if (destinationFormat === 's32') {
                return [-(2 ** 31), 0].includes(expectedDestinationValue) ? 0 : 2 ** 16;
            }

            if (destinationFormat === 'u8') {
                return [0, 2 ** 7].includes(expectedDestinationValue) ? 0 : 1;
            }
        }

        if (sourceFormat === 's32') {
            if (destinationFormat === 'f32') {
                return 0;
            }

            if (destinationFormat === 's16') {
                return [-(2 ** 15), 0].includes(expectedDestinationValue) ? 0 : 1;
            }

            if (destinationFormat === 'u8') {
                return [0, 2 ** 7].includes(expectedDestinationValue) ? 0 : 1;
            }
        }

        if (sourceFormat === 'u8') {
            if (destinationFormat === 'f32') {
                return 1 / 2 ** 16;
            }

            if (destinationFormat === 's16') {
                return [-(2 ** 15), 0].includes(expectedDestinationValue) ? 0 : 2 ** 8;
            }

            if (destinationFormat === 's32') {
                return [-(2 ** 31), 0].includes(expectedDestinationValue) ? 0 : 2 ** 24;
            }
        }
    }

    return 0;
};
