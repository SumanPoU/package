import { getFeatureDef } from "./registry";
import type { SteppedFeatureId, ToggleFeatureId } from "./types";

/** Live-region copy for stepped controls — e.g. "Text Size: Large (3 of 4)". */
export function announceStep(id: SteppedFeatureId, levelIndex: number): string {
  return (
    getFeatureDef(id)?.ariaAnnounce(levelIndex) ?? `Level ${levelIndex + 1}`
  );
}

/** Live-region copy for toggles — state only here; button name stays stable. */
export function announceToggle(id: ToggleFeatureId, on: boolean): string {
  return getFeatureDef(id)?.ariaAnnounce(on) ?? (on ? "on" : "off");
}

export const ANNOUNCE_RESET = "Preferences reset";
