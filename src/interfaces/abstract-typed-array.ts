export interface IAbstractTypedArray {
    BYTES_PER_ELEMENT: number;

    new (buffer: ArrayBufferLike, byteOffset?: number, length?: number): any;
}
