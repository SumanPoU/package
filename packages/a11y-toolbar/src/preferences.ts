import { DEFAULT_PREFERENCES, STEP_COUNT } from "./defaults";
import type {
  A11yPreferences,
  FeatureId,
  SteppedFeatureId,
  ToggleFeatureId,
} from "./types";

export function cycleStep<K extends SteppedFeatureId>(
  prefs: A11yPreferences,
  key: K,
): A11yPreferences {
  const max = STEP_COUNT[key];
  const next = (((prefs[key] as number) + 1) % max) as A11yPreferences[K];
  return { ...prefs, [key]: next };
}

export function toggleFeature(
  prefs: A11yPreferences,
  key: ToggleFeatureId,
): A11yPreferences {
  return { ...prefs, [key]: !prefs[key] };
}

export function resetPreferences(): A11yPreferences {
  return { ...DEFAULT_PREFERENCES };
}

/** Key-order-independent equality — scales when new features are added. */
export function isPreferencesEqual(
  a: A11yPreferences,
  b: A11yPreferences,
): boolean {
  const keys = Object.keys(DEFAULT_PREFERENCES) as FeatureId[];
  return keys.every((key) => a[key] === b[key]);
}
