export const filterEntries = <Entry extends [unknown, unknown]>(entries: Entry[], ...keys: Entry[1][]) =>
    Object.fromEntries(entries.filter(([key]) => keys.includes(key)));
