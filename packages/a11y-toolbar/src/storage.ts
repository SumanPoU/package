import { DEFAULT_PREFERENCES, STEP_COUNT } from "./defaults";
import { A11Y_FEATURE_REGISTRY } from "./registry";
import { clampSpeechRate } from "./speech";
import type {
  A11yPreferences,
  SteppedFeatureId,
  StoredPreferences,
  ToggleFeatureId,
} from "./types";
import { DEFAULT_STORAGE_KEY, PREFERENCES_SCHEMA_VERSION } from "./types";

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

/** Coerce unknown preference values into a full preferences object. */
export function normalizePreferences(raw: unknown): A11yPreferences {
  const src = isObject(raw) ? raw : {};
  const next = { ...DEFAULT_PREFERENCES };

  for (const feature of A11Y_FEATURE_REGISTRY) {
    if (feature.kind === "stepped") {
      const id = feature.id as SteppedFeatureId;
      next[id] = clampStep(src[id], STEP_COUNT[id]) as never;
    } else {
      const id = feature.id as ToggleFeatureId;
      next[id] = Boolean(src[id]) as never;
    }
  }

  next.speechRate = clampSpeechRate(
    src.speechRate,
    DEFAULT_PREFERENCES.speechRate,
  );

  return next;
}

function defaultStored(): StoredPreferences {
  return {
    schemaVersion: PREFERENCES_SCHEMA_VERSION,
    values: { ...DEFAULT_PREFERENCES },
  };
}

/**
 * Migrate any stored blob into the current `StoredPreferences` shape.
 * Never throws — corrupt / unknown data falls back to defaults.
 *
 * Extension point for future versions:
 * ```
 * if (version === 1) { ...migrate to 2... }
 * if (version === 2) { ...migrate to 3... }
 * ```
 */
export function migrate(stored: unknown): StoredPreferences {
  try {
    if (!isObject(stored)) return defaultStored();

    // Versioned document
    if (typeof stored.schemaVersion === "number" && isObject(stored.values)) {
      const version = stored.schemaVersion;
      const values: unknown = stored.values;

      // Future: if (version === 1) { values = migrateV1toV2(values); version = 2; }

      if (version > PREFERENCES_SCHEMA_VERSION) {
        // Newer client wrote this — best-effort normalize known keys.
        return {
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          values: normalizePreferences(values),
        };
      }

      if (version < 1) {
        return defaultStored();
      }

      return {
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        values: normalizePreferences(values),
      };
    }

    // Legacy unversioned preferences object (pre-schemaVersion).
    if ("textSize" in stored || "highContrast" in stored) {
      return {
        schemaVersion: PREFERENCES_SCHEMA_VERSION,
        values: normalizePreferences(stored),
      };
    }

    return defaultStored();
  } catch {
    return defaultStored();
  }
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
    return migrate(JSON.parse(raw) as unknown).values;
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
    const doc: StoredPreferences = {
      schemaVersion: PREFERENCES_SCHEMA_VERSION,
      values: prefs,
    };
    localStorage.setItem(storageKey, JSON.stringify(doc));
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
