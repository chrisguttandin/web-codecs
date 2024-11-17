import type { reverseByte as reverseByteFunction } from '../functions/reverse-byte';

const BLOCKSIZES = [64, 128, 256, 512, 1024, 2048, 4096, 8192];
const IS = 26995;
const VORB = 1987015266;

export const createReadVorbisConfig = (reverseByte: typeof reverseByteFunction) => (description: BufferSource) => {
    const arrayBuffer = description instanceof ArrayBuffer ? description : description.buffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    const identificationHeaderByteOffset = uint8Array[0] + 1;
    const dataView = new DataView(arrayBuffer);

    if (
        uint8Array.byteLength < identificationHeaderByteOffset + 7 ||
        dataView.getUint8(identificationHeaderByteOffset) !== 1 ||
        dataView.getUint32(identificationHeaderByteOffset + 1) !== VORB ||
        dataView.getUint16(identificationHeaderByteOffset + 5) !== IS
    ) {
        return null;
    }

    const blocksizeByte = uint8Array[identificationHeaderByteOffset + 28];
    // tslint:disable-next-line:no-bitwise
    const blocksizes: [number, number] = [BLOCKSIZES[(blocksizeByte & 0xf) - 6], BLOCKSIZES[(blocksizeByte >> 4) - 6]];

    if (blocksizes[0] > blocksizes[1]) {
        throw new Error('blocksize_0 must be less than or equal to blocksize_1.');
    }

    let bitOffset = 8;
    let byteOffset = uint8Array.byteLength - 2;

    const bytes: [number, number] = [reverseByte(uint8Array[byteOffset]), reverseByte(uint8Array[byteOffset + 1])];

    const advanceByteOffset = () => {
        byteOffset -= 1;
        bytes[1] = bytes[0];
        bytes[0] = reverseByte(uint8Array[byteOffset]);
    };
    const advanceBitOffset = () => {
        bitOffset -= 1;

        if (bitOffset === 0) {
            bitOffset = 8;

            advanceByteOffset();
        }
    };
    const readByte = () => {
        const invertedBitOffset = 8 - bitOffset;
        // tslint:disable-next-line:no-bitwise
        const byte = ((bytes[0] & (2 ** invertedBitOffset - 1)) << bitOffset) | (bytes[1] >> invertedBitOffset);

        advanceByteOffset();

        return byte;
    };
    const readBit = () => {
        const invertedBitOffset = 8 - bitOffset;
        // tslint:disable-next-line:no-bitwise
        const bit = (bytes[1] & (2 ** invertedBitOffset)) >> invertedBitOffset;

        advanceBitOffset();

        return bit;
    };

    // tslint:disable-next-line:no-empty
    while (readBit() === 0) {}

    const modeBlockflags: number[] = [];

    while (true) {
        advanceByteOffset();

        const potentialTransformTypeBytes = [readByte(), readByte()];
        const potentialWindowtypeBytes = [readByte(), readByte()];

        if (
            potentialTransformTypeBytes[0] === 0 &&
            potentialTransformTypeBytes[0] === 0 &&
            potentialWindowtypeBytes[0] === 0 &&
            potentialWindowtypeBytes[0] === 0
        ) {
            modeBlockflags.unshift(readBit());

            continue;
        }

        // tslint:disable-next-line:no-bitwise
        if (modeBlockflags.length === (reverseByte(potentialTransformTypeBytes[0] & 0b00111111) >> 2) + 1) {
            break;
        }

        throw new Error('Unexpected mode_count.');
    }

    return {
        blocksizes,
        modeBlockflags,
        // tslint:disable-next-line:no-bitwise
        modeMask: (1 << Math.log2(modeBlockflags.length)) - 1,
        prevBlockSize: <null | number>null,
        sampleRate: dataView.getUint32(identificationHeaderByteOffset + 12, true)
    };
};
