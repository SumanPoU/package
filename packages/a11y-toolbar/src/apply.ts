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

/**
 * Mirror preferences onto a root element (default `<html>`).
 * Visual effects come from package CSS (`styles.css`).
 */
export function applyA11yPreferences(
  prefs: A11yPreferences,
  options: ApplyA11yOptions = {},
): void {
  if (typeof document === "undefined") return;
  const root = options.root ?? document.documentElement;

  root.setAttribute(ATTR.textSize, String(prefs.textSize));
  root.setAttribute(ATTR.highContrast, String(prefs.highContrast));
  root.setAttribute(ATTR.textAlign, String(prefs.textAlign));
  root.setAttribute(ATTR.colorFilter, String(prefs.colorFilter));
  root.setAttribute(ATTR.textSpacing, String(prefs.textSpacing));
  root.setAttribute(ATTR.lineHeight, String(prefs.lineHeight));
  root.setAttribute(ATTR.fontSelection, String(prefs.fontSelection));
  root.setAttribute(ATTR.saturation, String(prefs.saturation));
  root.setAttribute(ATTR.dyslexiaFriendly, prefs.dyslexiaFriendly ? "1" : "0");
  root.setAttribute(ATTR.biggerCursor, prefs.biggerCursor ? "1" : "0");
  root.setAttribute(ATTR.hideImages, prefs.hideImages ? "1" : "0");
  root.setAttribute(ATTR.pauseAnimations, prefs.pauseAnimations ? "1" : "0");
  root.setAttribute(ATTR.readingGuide, prefs.readingGuide ? "1" : "0");
  root.setAttribute(ATTR.highlightLinks, prefs.highlightLinks ? "1" : "0");
  root.setAttribute(ATTR.zoomSupport, supportsCssZoom() ? "1" : "0");

  // Dyslexia Friendly reuses max Text Spacing + Line Height presets (1.4.12).
  const spacingLevel = prefs.dyslexiaFriendly
    ? DYSLEXIA_SPACING_LEVEL
    : prefs.textSpacing;
  const lineLevel = prefs.dyslexiaFriendly
    ? DYSLEXIA_LINE_HEIGHT_LEVEL
    : prefs.lineHeight;

  root.style.setProperty(
    "--a11y-font-scale",
    String(TEXT_SIZE_ZOOMS[prefs.textSize]),
  );
  root.style.setProperty(
    "--a11y-letter-spacing",
    `${LETTER_SPACING_EM[spacingLevel]}em`,
  );
  root.style.setProperty(
    "--a11y-word-spacing",
    `${WORD_SPACING_EM[spacingLevel]}em`,
  );
  root.style.setProperty(
    "--a11y-line-height",
    String(LINE_HEIGHT_VALUES[lineLevel]),
  );
  root.style.setProperty(
    "--a11y-saturation",
    String(SATURATION_VALUES[prefs.saturation]),
  );
  root.style.setProperty(
    "--a11y-color-filter",
    COLOR_FILTER_VALUES[prefs.colorFilter],
  );
}

/** Remove all a11y attrs/vars set by this package. */
export function clearA11yPreferences(options: ApplyA11yOptions = {}): void {
  if (typeof document === "undefined") return;
  const root = options.root ?? document.documentElement;
  for (const attr of Object.values(ATTR)) {
    root.removeAttribute(attr);
  }
  for (const prop of [
    "--a11y-font-scale",
    "--a11y-letter-spacing",
    "--a11y-word-spacing",
    "--a11y-line-height",
    "--a11y-saturation",
    "--a11y-color-filter",
  ]) {
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
