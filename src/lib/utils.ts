import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { HTMLAttributes } from "svelte/elements";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type WithElementRef<T extends HTMLAttributes<HTMLElement>, E extends HTMLElement = HTMLElement> = T & {
  ref?: E | null;
};
