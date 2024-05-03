export const deinterleave = (data) =>
    Array.from({ length: data.length }, (_, index) => data[index < data.length / 2 ? index * 2 : (index - data.length / 2) * 2 + 1]);
