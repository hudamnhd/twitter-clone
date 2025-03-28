import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function lightDarkVar(baseName: string) {
  return `var(--theme-light, hsl(var(--${baseName}))) var(--theme-dark, hsl(var(--${baseName}-dark))) `;
}

export function getInitials(fullName: string): string | null {
  if (!fullName) return null;
  const nameParts = fullName?.trim().split(/\s+/).filter(Boolean);

  if (nameParts.length === 0) return "";

  if (nameParts.length === 1) {
    return nameParts[0].charAt(0).toUpperCase();
  }

  const firstChar = nameParts[0].charAt(0).toUpperCase();
  let secondChar = nameParts[1].charAt(0).toUpperCase();

  if (!/[A-Za-z]/.test(secondChar)) {
    secondChar = nameParts[0].slice(-1).toUpperCase();
  }

  return firstChar + secondChar;
}
