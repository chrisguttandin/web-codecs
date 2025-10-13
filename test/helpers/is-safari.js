export const isSafari = ({ userAgent }) => !/Chrome/.test(userAgent) && /Safari/.test(userAgent);
