"use client";

export type { A11yToolbarProps } from "./A11yToolbar";
export {
  A11yToolbar,
  hasActiveA11yPreferences,
  resolvePanelAlign,
  resolvePanelStyle,
} from "./A11yToolbar";
export {
  A11Y_ATTRS,
  applyA11yPreferences,
  cancelScheduledApplyA11yPreferences,
  clearA11yPreferences,
  flushApplyA11yPreferences,
  resolveSpacingVars,
  scheduleApplyA11yPreferences,
} from "./apply";
export { CSS_VAR, EFFECT_CSS_VARS } from "./css-vars";
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
export type {
  A11yLocaleDictionaries,
  A11yLocaleFontMap,
  A11yMessages,
  A11yMessagesPartial,
} from "./i18n";
export {
  clearStoredLocale,
  collectFallbackPaths,
  DEFAULT_LOCALE_FONTS,
  deepMergeMessages,
  EN_MESSAGES,
  formatAnnounceStep,
  formatAnnounceToggle,
  formatLevelFallback,
  getStoredLocale,
  listAvailableLocales,
  localeStorageKey,
  NE_MESSAGES,
  NE_MESSAGES_DEMO,
  resolveLocaleFont,
  resolveLocaleName,
  resolveMessages,
  setStoredLocale,
} from "./i18n";
export {
  adjustStep,
  cycleStep,
  isPreferencesEqual,
  resetPreferences,
  toggleFeature,
} from "./preferences";
export type {
  A11yFeatureDef,
  A11ySectionId,
  FeatureIconId,
  FeatureKind,
} from "./registry";
export {
  A11Y_FEATURE_REGISTRY,
  FEATURE_REGISTRY,
  getFeatureDef,
  getSectionsWithFeatures,
  isSteppedFeature,
  isToggleFeature,
  SECTION_META,
} from "./registry";
export type {
  A11yKeyCombo,
  A11yShortcutAction,
  A11yShortcutDef,
} from "./shortcuts";
export {
  DEFAULT_A11Y_SHORTCUTS,
  formatShortcutLabel,
  mergeA11yShortcuts,
  resolveA11yShortcuts,
} from "./shortcuts";
export {
  clearStoredPreferences,
  getStoredPreferences,
  migrate,
  normalizePreferences,
  setStoredPreferences,
} from "./storage";
// Convenience re-exports for Client Components.
// Server Components must import FOUC/apply helpers from
// `@itzsa/a11y-toolbar/headless` instead of this entry.
export type {
  A11yFeatureFlags,
  A11yHotkey,
  A11yPanelAlign,
  A11yPreferences,
  A11yResolvedPanelAlign,
  A11yToolbarPosition,
  A11yToolbarTheme,
  ApplyA11yOptions,
  FeatureId,
  SteppedFeatureId,
  StoredPreferences,
  ToggleFeatureId,
} from "./types";
export {
  A11Y_CONTENT_ATTR,
  A11Y_TOOLBAR_ATTR,
  DEFAULT_A11Y_THEME,
  DEFAULT_HOTKEY,
  DEFAULT_STORAGE_KEY,
  PREFERENCES_SCHEMA_VERSION,
} from "./types";
