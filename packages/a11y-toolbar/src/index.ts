"use client";

export type { A11yToolbarProps } from "./A11yToolbar";
export { A11yToolbar, hasActiveA11yPreferences } from "./A11yToolbar";
export {
  A11Y_ATTRS,
  applyA11yPreferences,
  clearA11yPreferences,
  resolveSpacingVars,
} from "./apply";
export { DEFAULT_PREFERENCES, FEATURE_LABELS, STEP_COUNT } from "./defaults";
export {
  DYSLEXIA_LINE_HEIGHT_LEVEL,
  DYSLEXIA_SPACING_LEVEL,
  LETTER_SPACING_EM,
  LINE_HEIGHT_VALUES,
  supportsCssZoom,
  TEXT_SIZE_ZOOMS,
  WORD_SPACING_EM,
} from "./effect-values";
export { getA11yFoucScript } from "./fouc-script";
export {
  cycleStep,
  isPreferencesEqual,
  resetPreferences,
  toggleFeature,
} from "./preferences";
export type { FeatureDefinition, FeatureKind } from "./registry";
export {
  FEATURE_REGISTRY,
  getFeatureDef,
  isSteppedFeature,
  isToggleFeature,
  SECTION_META,
} from "./registry";
export {
  clearStoredPreferences,
  getStoredPreferences,
  normalizePreferences,
  setStoredPreferences,
} from "./storage";
// Convenience re-exports for Client Components.
// Server Components must import FOUC/apply helpers from
// `@itzsa/a11y-toolbar/headless` instead of this entry.
export type {
  A11yFeatureFlags,
  A11yHotkey,
  A11yPreferences,
  A11yToolbarPosition,
  ApplyA11yOptions,
  FeatureId,
  SteppedFeatureId,
  ToggleFeatureId,
} from "./types";
export {
  A11Y_CONTENT_ATTR,
  A11Y_TOOLBAR_ATTR,
  DEFAULT_HOTKEY,
  DEFAULT_STORAGE_KEY,
} from "./types";
