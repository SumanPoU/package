/**
 * Namespaced CSS custom properties (`--itzsa-a11y-*`).
 * Convention: `--itzsa-{package}-{token}` — see repo STANDARDS.md.
 */

export const CSS_VAR = {
  fontScale: "--itzsa-a11y-font-scale",
  letterSpacing: "--itzsa-a11y-letter-spacing",
  wordSpacing: "--itzsa-a11y-word-spacing",
  lineHeight: "--itzsa-a11y-line-height",
  saturation: "--itzsa-a11y-saturation",
  colorFilter: "--itzsa-a11y-color-filter",
  guideHeight: "--itzsa-a11y-guide-height",
  offset: "--itzsa-a11y-offset",
  toolbarHeader: "--itzsa-a11y-toolbar-header",
  toolbarHeaderFg: "--itzsa-a11y-toolbar-header-fg",
  toolbarBg: "--itzsa-a11y-toolbar-bg",
  toolbarCard: "--itzsa-a11y-toolbar-card",
  toolbarFg: "--itzsa-a11y-toolbar-fg",
  toolbarMuted: "--itzsa-a11y-toolbar-muted",
  toolbarAccent: "--itzsa-a11y-toolbar-accent",
  toolbarBorder: "--itzsa-a11y-toolbar-border",
  toolbarShadow: "--itzsa-a11y-toolbar-shadow",
  toolbarRadius: "--itzsa-a11y-toolbar-radius",
  toolbarZ: "--itzsa-a11y-toolbar-z",
  toolbarFocus: "--itzsa-a11y-toolbar-focus",
  toolbarFont: "--itzsa-a11y-toolbar-font",
  toolbarIcon: "--itzsa-a11y-toolbar-icon",
  launcherSize: "--itzsa-a11y-launcher-size",
  launcherBg: "--itzsa-a11y-launcher-bg",
  launcherFg: "--itzsa-a11y-launcher-fg",
  launcherRing: "--itzsa-a11y-launcher-ring",
  launcherRadius: "--itzsa-a11y-launcher-radius",
} as const;

/** Effect vars written by apply / FOUC (cleanup list). */
export const EFFECT_CSS_VARS = [
  CSS_VAR.fontScale,
  CSS_VAR.letterSpacing,
  CSS_VAR.wordSpacing,
  CSS_VAR.lineHeight,
  CSS_VAR.saturation,
  CSS_VAR.colorFilter,
] as const;
