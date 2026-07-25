import { DEFAULT_PREFERENCES, STEP_COUNT } from "./defaults";
import { FEATURE_REGISTRY } from "./registry";
import type {
  A11yPreferences,
  SteppedFeatureId,
  ToggleFeatureId,
} from "./types";
import { DEFAULT_STORAGE_KEY } from "./types";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clampStep(value: unknown, maxExclusive: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  const i = Math.trunc(n);
  if (i < 0) return 0;
  if (i >= maxExclusive) return maxExclusive - 1;
  return i;
}

/** Coerce unknown JSON into a full preferences object (registry-driven). */
export function normalizePreferences(raw: unknown): A11yPreferences {
  const src = isObject(raw) ? raw : {};
  const next = { ...DEFAULT_PREFERENCES };

  for (const feature of FEATURE_REGISTRY) {
    if (feature.kind === "step") {
      const id = feature.id as SteppedFeatureId;
      next[id] = clampStep(src[id], STEP_COUNT[id]) as never;
    } else {
      const id = feature.id as ToggleFeatureId;
      next[id] = Boolean(src[id]) as never;
    }
  }

  return next;
}

export function getStoredPreferences(
  storageKey: string = DEFAULT_STORAGE_KEY,
): A11yPreferences {
  if (typeof localStorage === "undefined") {
    return { ...DEFAULT_PREFERENCES };
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { ...DEFAULT_PREFERENCES };
    return normalizePreferences(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function setStoredPreferences(
  prefs: A11yPreferences,
  storageKey: string = DEFAULT_STORAGE_KEY,
): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(prefs));
  } catch {
    // Quota / private mode — ignore.
  }
}

export function clearStoredPreferences(
  storageKey: string = DEFAULT_STORAGE_KEY,
): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // ignore
  }
}
