import { DEFAULT_STORAGE_KEY } from "../types";

/** localStorage key for toolbar locale — separate from preference schema. */
export function localeStorageKey(
  storageKey: string = DEFAULT_STORAGE_KEY,
): string {
  return `${storageKey}:locale`;
}

export function getStoredLocale(
  storageKey: string = DEFAULT_STORAGE_KEY,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(localeStorageKey(storageKey));
    if (!raw) return null;
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  } catch {
    return null;
  }
}

export function setStoredLocale(
  locale: string,
  storageKey: string = DEFAULT_STORAGE_KEY,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(localeStorageKey(storageKey), locale);
  } catch {
    /* quota / private mode */
  }
}

export function clearStoredLocale(
  storageKey: string = DEFAULT_STORAGE_KEY,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(localeStorageKey(storageKey));
  } catch {
    /* ignore */
  }
}
