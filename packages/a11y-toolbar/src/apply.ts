import { CSS_VAR, EFFECT_CSS_VARS } from "./css-vars";
import {
  COLOR_FILTER_VALUES,
  DYSLEXIA_LINE_HEIGHT_LEVEL,
  DYSLEXIA_SPACING_LEVEL,
  LETTER_SPACING_EM,
  LINE_HEIGHT_VALUES,
  SATURATION_VALUES,
  supportsCssZoom,
  TEXT_SIZE_ZOOMS,
  WORD_SPACING_EM,
} from "./effect-values";
import { A11Y_FEATURE_REGISTRY } from "./registry";
import type { A11yPreferences, ApplyA11yOptions } from "./types";

const ATTR = {
  textSize: "data-a11y-text-size",
  highContrast: "data-a11y-contrast",
  textAlign: "data-a11y-align",
  colorFilter: "data-a11y-color-filter",
  textSpacing: "data-a11y-text-spacing",
  lineHeight: "data-a11y-line-height",
  fontSelection: "data-a11y-font",
  saturation: "data-a11y-saturation",
  dyslexiaFriendly: "data-a11y-dyslexia",
  biggerCursor: "data-a11y-bigger-cursor",
  hideImages: "data-a11y-hide-images",
  pauseAnimations: "data-a11y-pause-animations",
  readingGuide: "data-a11y-reading-guide",
  highlightLinks: "data-a11y-highlight-links",
  zoomSupport: "data-a11y-zoom-support",
} as const;

/** @deprecated Use TEXT_SIZE_ZOOMS from effect-values. */
export const FONT_SCALES = TEXT_SIZE_ZOOMS;

function syncEffectCssVars(root: HTMLElement, prefs: A11yPreferences): void {
  const spacingLevel = prefs.dyslexiaFriendly
    ? DYSLEXIA_SPACING_LEVEL
    : prefs.textSpacing;
  const lineLevel = prefs.dyslexiaFriendly
    ? DYSLEXIA_LINE_HEIGHT_LEVEL
    : prefs.lineHeight;

  root.style.setProperty(
    CSS_VAR.fontScale,
    String(TEXT_SIZE_ZOOMS[prefs.textSize]),
  );
  root.style.setProperty(
    CSS_VAR.letterSpacing,
    `${LETTER_SPACING_EM[spacingLevel]}em`,
  );
  root.style.setProperty(
    CSS_VAR.wordSpacing,
    `${WORD_SPACING_EM[spacingLevel]}em`,
  );
  root.style.setProperty(
    CSS_VAR.lineHeight,
    String(LINE_HEIGHT_VALUES[lineLevel]),
  );
  root.style.setProperty(
    CSS_VAR.saturation,
    String(SATURATION_VALUES[prefs.saturation]),
  );
  root.style.setProperty(
    CSS_VAR.colorFilter,
    COLOR_FILTER_VALUES[prefs.colorFilter],
  );
}

/**
 * Mirror preferences onto a root element (default `<html>`).
 * Visual effects come from package CSS (`styles.css`).
 * Synchronous — prefer `scheduleApplyA11yPreferences` for rapid UI cycling.
 */
export function applyA11yPreferences(
  prefs: A11yPreferences,
  options: ApplyA11yOptions = {},
): void {
  if (typeof document === "undefined") return;
  const root = options.root ?? document.documentElement;

  for (const feature of A11Y_FEATURE_REGISTRY) {
    feature.apply(root, prefs[feature.id]);
  }
  root.setAttribute(ATTR.zoomSupport, supportsCssZoom() ? "1" : "0");
  syncEffectCssVars(root, prefs);
}

let applyTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPrefs: A11yPreferences | null = null;
let pendingOptions: ApplyA11yOptions = {};

const DEFAULT_DEBOUNCE_MS = 50;

/**
 * Debounced DOM write (trailing edge). React preference state stays sync;
 * only attribute / CSS-var mutation is delayed.
 */
export function scheduleApplyA11yPreferences(
  prefs: A11yPreferences,
  options: ApplyA11yOptions = {},
  delayMs: number = DEFAULT_DEBOUNCE_MS,
): void {
  pendingPrefs = prefs;
  pendingOptions = options;
  if (applyTimer != null) clearTimeout(applyTimer);
  applyTimer = setTimeout(() => {
    applyTimer = null;
    if (pendingPrefs) {
      applyA11yPreferences(pendingPrefs, pendingOptions);
      pendingPrefs = null;
    }
  }, delayMs);
}

/** Flush a pending debounced apply immediately (reset / unmount / tests). */
export function flushApplyA11yPreferences(): void {
  if (applyTimer != null) {
    clearTimeout(applyTimer);
    applyTimer = null;
  }
  if (pendingPrefs) {
    applyA11yPreferences(pendingPrefs, pendingOptions);
    pendingPrefs = null;
  }
}

/** Cancel a pending debounced apply without writing. */
export function cancelScheduledApplyA11yPreferences(): void {
  if (applyTimer != null) {
    clearTimeout(applyTimer);
    applyTimer = null;
  }
  pendingPrefs = null;
}

/** Remove all a11y attrs/vars set by this package. */
export function clearA11yPreferences(options: ApplyA11yOptions = {}): void {
  if (typeof document === "undefined") return;
  cancelScheduledApplyA11yPreferences();
  const root = options.root ?? document.documentElement;
  for (const attr of Object.values(ATTR)) {
    root.removeAttribute(attr);
  }
  for (const prop of EFFECT_CSS_VARS) {
    root.style.removeProperty(prop);
  }
}

/** Effective spacing vars for a prefs object (shared by Dyslexia + stepped). */
export function resolveSpacingVars(prefs: A11yPreferences): {
  letterSpacingEm: number;
  wordSpacingEm: number;
  lineHeight: number;
} {
  const spacingLevel = prefs.dyslexiaFriendly
    ? DYSLEXIA_SPACING_LEVEL
    : prefs.textSpacing;
  const lineLevel = prefs.dyslexiaFriendly
    ? DYSLEXIA_LINE_HEIGHT_LEVEL
    : prefs.lineHeight;
  return {
    letterSpacingEm: LETTER_SPACING_EM[spacingLevel],
    wordSpacingEm: WORD_SPACING_EM[spacingLevel],
    lineHeight: LINE_HEIGHT_VALUES[lineLevel],
  };
}

export { ATTR as A11Y_ATTRS };
