import { FEATURE_LABELS, STEP_COUNT } from "./defaults";
import { STEP_LEVEL_LABELS } from "./effect-values";
import type { SteppedFeatureId, ToggleFeatureId } from "./types";

/** Live-region copy for stepped controls — e.g. "Text Size: Large (3 of 4)". */
export function announceStep(id: SteppedFeatureId, levelIndex: number): string {
  const labels = STEP_LEVEL_LABELS[id];
  const name = labels[levelIndex] ?? `Level ${levelIndex + 1}`;
  const total = STEP_COUNT[id];
  return `${FEATURE_LABELS[id]}: ${name} (${levelIndex + 1} of ${total})`;
}

/** Live-region copy for toggles — state only here; button name stays stable. */
export function announceToggle(id: ToggleFeatureId, on: boolean): string {
  return `${FEATURE_LABELS[id]}: ${on ? "on" : "off"}`;
}

export const ANNOUNCE_RESET = "Preferences reset";
