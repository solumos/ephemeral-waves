import { writable } from 'svelte/store';

export const walletEnabled = writable(false);
export const currentAccount = writable("");
export const networkReady = writable(false);
export const waves = writable([]);
export const waveCount = writable(0);