// @todo standardized-audio-context has a more complicated version of this function.
export const detachArrayBuffer = (arrayBuffer: ArrayBuffer): void => {
    const { port1 } = new MessageChannel();

    try {
        port1.postMessage(arrayBuffer, [arrayBuffer]);
    } catch {
        // Ignore errors.
    } finally {
        port1.close();
    }
};
