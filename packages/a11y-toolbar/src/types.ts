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
  | "top-left";

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
  /** Horizontal reading band that follows the pointer (Astral/Sienna-style). */
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
