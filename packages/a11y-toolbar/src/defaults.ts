import { FEATURE_REGISTRY, SECTION_META } from "./registry";
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

/** Derived from FEATURE_REGISTRY — do not duplicate step counts elsewhere. */
export const STEP_COUNT: Record<SteppedFeatureId, number> = Object.fromEntries(
  FEATURE_REGISTRY.filter((f) => f.kind === "step").map((f) => [
    f.id,
    f.steps ?? 3,
  ]),
) as Record<SteppedFeatureId, number>;

export const FEATURE_LABELS: Record<FeatureId, string> = {
  textSize: "Text Size",
  highContrast: "High Contrast",
  textAlign: "Text Align",
  colorFilter: "Color Filter",
  textSpacing: "Text Spacing",
  lineHeight: "Line Height",
  fontSelection: "Font Selection",
  saturation: "Saturation",
  dyslexiaFriendly: "Dyslexia Friendly",
  biggerCursor: "Bigger Cursor",
  hideImages: "Hide Images",
  pauseAnimations: "Pause Animations",
  readingGuide: "Reading Guide",
  highlightLinks: "Highlight Links",
};

/** @deprecated Prefer FEATURE_REGISTRY — kept for older imports. */
export const STEPPED_FEATURES: SteppedFeatureId[] = FEATURE_REGISTRY.filter(
  (f) => f.kind === "step",
).map((f) => f.id as SteppedFeatureId);

export const FEATURE_SECTIONS = (
  Object.keys(SECTION_META) as Array<keyof typeof SECTION_META>
).map((key) => ({
  ...SECTION_META[key],
  features: FEATURE_REGISTRY.filter((f) => f.section === key).map((f) => f.id),
}));
