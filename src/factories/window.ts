import { TWindow } from '../types';

export const createWindow = (): null | TWindow => (typeof window === 'undefined' ? null : window);
