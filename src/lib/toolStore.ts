import { writable } from 'svelte/store';

export const activeTool = writable<string | null>(null);
