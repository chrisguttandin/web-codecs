import { IAbstractTypedArray } from '../interfaces';

export const convertBufferSourceToTypedArray = <TypedArrayConstructor extends IAbstractTypedArray>(
    bufferSource: BufferSource,
    constructor: TypedArrayConstructor
): InstanceType<TypedArrayConstructor> => {
    if (bufferSource instanceof ArrayBuffer) {
        return new constructor(bufferSource);
    }

    return new constructor(bufferSource.buffer, bufferSource.byteOffset, bufferSource.byteLength / constructor.BYTES_PER_ELEMENT);
};
