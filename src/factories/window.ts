import { TWindow } from '../types';

export const createWindow = () => (typeof window === 'undefined' ? null : <TWindow>window);
