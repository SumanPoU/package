/**
 * Single source of truth for effect numeric presets.
 * WCAG 1.4.12 floors (level index 2 / max):
 * - letter-spacing ≥ 0.12em
 * - word-spacing ≥ 0.16em
 * - line-height ≥ 1.5
 */

/** Text Size zoom factors: 100% / 112.5% / 125% / 145%. */
export const TEXT_SIZE_ZOOMS = [1, 1.125, 1.25, 1.45] as const;

/** Letter-spacing in `em` by Text Spacing level (0–2). */
export const LETTER_SPACING_EM = [0, 0.06, 0.12] as const;

/** Word-spacing in `em` by Text Spacing level (0–2). */
export const WORD_SPACING_EM = [0, 0.08, 0.16] as const;

/** Unitless line-height by Line Height level (0–2). All ≥ 1.5. */
export const LINE_HEIGHT_VALUES = [1.5, 1.75, 2] as const;

/** Max stepped index for Text Spacing / Line Height (WCAG 1.4.12 preset). */
export const SPACING_MAX_LEVEL = 2;

/** Dyslexia Friendly reuses the same max spacing + line-height presets. */
export const DYSLEXIA_SPACING_LEVEL = SPACING_MAX_LEVEL;
export const DYSLEXIA_LINE_HEIGHT_LEVEL = SPACING_MAX_LEVEL;

export const SATURATION_VALUES = [1, 0.45, 0] as const;

export const COLOR_FILTER_VALUES = [
  "none",
  "grayscale(1)",
  "hue-rotate(180deg) contrast(1.15)",
  "sepia(0.9) hue-rotate(55deg) saturate(1.2)",
] as const;

/** Human-readable level names for visible labels + live region (1-based display). */
export const STEP_LEVEL_LABELS = {
  textSize: ["Default", "Medium", "Large", "Extra large"],
  highContrast: ["Off", "Soft", "Maximum"],
  textAlign: ["Left", "Center", "Right"],
  colorFilter: ["Off", "Grayscale", "Hue shift", "Sepia"],
  textSpacing: ["Default", "Relaxed", "Maximum"],
  lineHeight: ["Default", "Relaxed", "Maximum"],
  fontSelection: ["Default", "System UI", "Serif"],
  saturation: ["Full", "Reduced", "None"],
} as const;

export function supportsCssZoom(): boolean {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return false;
  }
  return CSS.supports("zoom", "1.5");
}
