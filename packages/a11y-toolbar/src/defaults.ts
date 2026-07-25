import { A11Y_FEATURE_REGISTRY, SECTION_META } from "./registry";
import type { A11yPreferences, FeatureId, SteppedFeatureId } from "./types";

export const DEFAULT_PREFERENCES: A11yPreferences = {
  textSize: 0,
  highContrast: 0,
  textAlign: 0,
  colorFilter: 0,
  textSpacing: 0,
  lineHeight: 0,
  fontSelection: 0,
  saturation: 0,
  dyslexiaFriendly: false,
  biggerCursor: false,
  hideImages: false,
  pauseAnimations: false,
  readingGuide: false,
  highlightLinks: false,
};

/** Derived from A11Y_FEATURE_REGISTRY — do not duplicate step counts elsewhere. */
export const STEP_COUNT: Record<SteppedFeatureId, number> = Object.fromEntries(
  A11Y_FEATURE_REGISTRY.filter((f) => f.kind === "stepped").map((f) => [
    f.id,
    f.levels ?? 3,
  ]),
) as Record<SteppedFeatureId, number>;

export const FEATURE_LABELS: Record<FeatureId, string> = Object.fromEntries(
  A11Y_FEATURE_REGISTRY.map((f) => [f.id, f.labels.title]),
) as Record<FeatureId, string>;

/** @deprecated Prefer A11Y_FEATURE_REGISTRY */
export const STEPPED_FEATURES: SteppedFeatureId[] =
  A11Y_FEATURE_REGISTRY.filter((f) => f.kind === "stepped").map(
    (f) => f.id as SteppedFeatureId,
  );

export const FEATURE_SECTIONS = (
  Object.keys(SECTION_META) as Array<keyof typeof SECTION_META>
).map((key) => ({
  ...SECTION_META[key],
  features: A11Y_FEATURE_REGISTRY.filter((f) => f.section === key).map(
    (f) => f.id,
  ),
}));
