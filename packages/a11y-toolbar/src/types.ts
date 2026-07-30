/** Attribute marking the SSR content root that receives visual effects. */
export const A11Y_CONTENT_ATTR = "data-a11y-content";

/** Attribute marking toolbar chrome (never targeted by hide-images / filters). */
export const A11Y_TOOLBAR_ATTR = "data-a11y-toolbar";

/** Default localStorage key. */
export const DEFAULT_STORAGE_KEY = "itzsa-a11y";

/** Default hotkey: Alt+A. Pass `null` to disable. */
export const DEFAULT_HOTKEY = { altKey: true, key: "a" } as const;

export type SteppedFeatureId =
  | "textSize"
  | "highContrast"
  | "textAlign"
  | "colorFilter"
  | "textSpacing"
  | "lineHeight"
  | "fontSelection"
  | "saturation";

export type ToggleFeatureId =
  | "dyslexiaFriendly"
  | "biggerCursor"
  | "hideImages"
  | "pauseAnimations"
  | "readingGuide"
  | "highlightLinks";

export type FeatureId = SteppedFeatureId | ToggleFeatureId;

export type A11yToolbarPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "top-center"
  | "middle-left"
  | "middle-right";

/**
 * Horizontal placement of the open panel, independent of the launcher.
 * - `"auto"` — follow the launcher (corners / center / beside middle edges)
 * - `"left"` / `"right"` — flush to that viewport edge (`left: 0` / `right: 0` + offset)
 * - `"center"` — horizontally centered
 */
export type A11yPanelAlign = "auto" | "left" | "right" | "center";

/** Resolved panel align class (after expanding `"auto"`). */
export type A11yResolvedPanelAlign =
  | "left"
  | "right"
  | "center"
  | "beside-left"
  | "beside-right";

/**
 * Theme tokens for chrome (header, accents, focus, type, launcher) and optional
 * effect tokens (cursor, reading guide). Prefer host CSS variables
 * (e.g. `var(--accent)`) so light/dark stay in sync.
 * Defaults match the itzsa brand green with WCAG-safe header foreground.
 *
 * Every token maps to a `--itzsa-a11y-*` CSS custom property — you can also set
 * those directly via the `style` prop or a host stylesheet.
 */
export type A11yToolbarTheme = {
  /** Primary accent — icons, steps, pressed borders (default `#1d9e75`). */
  accent?: string;
  /** Header background (defaults to accent). */
  header?: string;
  /**
   * Header title + icon button color.
   * Default `#ffffff` on header `#15805f` (~4.9:1) — AA for normal text.
   * Do not pair `#ffffff` with brand accent `#1d9e75` (~3.4:1) or `#04342c` on
   * `#1d9e75` (~4.05:1); both miss 4.5:1.
   */
  headerForeground?: string;
  /** Card / panel icon + step fill (defaults to accent). */
  icon?: string;
  /** Focus ring for launcher, cards, header buttons (non-text ≥3:1). */
  focusRing?: string;
  /**
   * Force one font stack for **all** locales.
   * Prefer `fontFamilyByLocale` when English/Nepali need different faces.
   */
  fontFamily?: string;
  /**
   * Per-locale font stacks. Defaults: `en` → Outfit, `ne` → Poppins.
   * Merged over built-ins; ignored when `fontFamily` is set.
   */
  fontFamilyByLocale?: Record<string, string>;
  /** Floating launcher button fill (defaults to accent). */
  launcher?: string;
  /** Launcher glyph color (Aa + slider) — default `#ffffff`. */
  launcherForeground?: string;
  /** Thin outer ring for contrast on busy pages — default `#ffffff`. */
  launcherRing?: string;
  /** Launcher corner radius (default `999px`). */
  launcherRadius?: string;
  /** Panel shell background. */
  background?: string;
  /** Feature card background. */
  card?: string;
  /** Panel body text color. */
  foreground?: string;
  /** Muted labels / secondary text. */
  muted?: string;
  /** Borders (cards, dividers). */
  border?: string;
  /** Panel + launcher shadow. */
  shadow?: string;
  /** Panel corner radius. */
  radius?: string;
  /** Stacking order for chrome (default `2147483000`). */
  zIndex?: string | number;
  /**
   * Bigger-cursor value: `url("…") 2 2` (keyword fallback `auto` is in CSS).
   * Applied when the Bigger Cursor preference is on.
   */
  cursor?: string;
  /** Reading-guide band height (e.g. `"48px"`). */
  guideHeight?: string;
};

/** itzsa brand defaults (aligned with docs site `--accent` / `--accent-fg`). */
export const DEFAULT_A11Y_THEME = {
  accent: "#1d9e75",
  /** Darker than brand accent so white header text clears 4.5:1. */
  header: "#15805f",
  headerForeground: "#ffffff",
  focusRing: "#0b3d34",
  launcher: "#1d9e75",
  launcherForeground: "#ffffff",
  launcherRing: "#ffffff",
  fontFamily:
    'var(--font-outfit), "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif',
} as const;

/**
 * User preferences. Attributes are mirrored onto `<html>`; CSS effects
 * apply under `[data-a11y-content]` (see `applyA11yPreferences`).
 */
export type A11yPreferences = {
  /** 0 = default … 3 = largest */
  textSize: 0 | 1 | 2 | 3;
  /** 0 = off, 1 = medium, 2 = high */
  highContrast: 0 | 1 | 2;
  /** 0 = left, 1 = center, 2 = right */
  textAlign: 0 | 1 | 2;
  /** 0 = off, 1 = grayscale, 2 = hue-shift, 3 = sepia-ish */
  colorFilter: 0 | 1 | 2 | 3;
  textSpacing: 0 | 1 | 2;
  lineHeight: 0 | 1 | 2;
  /** 0 = default, 1 = system UI, 2 = readable serif */
  fontSelection: 0 | 1 | 2;
  saturation: 0 | 1 | 2;
  /** Spacing-only reading aid (no bundled dyslexia font). */
  dyslexiaFriendly: boolean;
  biggerCursor: boolean;
  hideImages: boolean;
  pauseAnimations: boolean;
  /** Horizontal reading band that follows the pointer. */
  readingGuide: boolean;
  /** Emphasize anchors for low-vision scanning. */
  highlightLinks: boolean;
};

export type A11yHotkey = {
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  /** Lowercase letter or named key (`"a"`, `"Escape"`). */
  key: string;
} | null;

export type A11yFeatureFlags = Partial<Record<FeatureId, boolean>>;

export type ApplyA11yOptions = {
  /** Element that receives `data-a11y-*` attrs and CSS vars (default: documentElement). */
  root?: HTMLElement;
};

/** Current localStorage document schema version. */
export const PREFERENCES_SCHEMA_VERSION = 1;

/**
 * Versioned localStorage document.
 * Legacy unversioned blobs are migrated via `migrate()` in storage.ts.
 */
export type StoredPreferences = {
  schemaVersion: number;
  values: A11yPreferences;
};
