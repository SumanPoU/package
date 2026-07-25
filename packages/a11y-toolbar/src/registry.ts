/**
 * Feature registry — single source of truth (React-free).
 * UI maps `iconId` → components in `icons.tsx`. Adding a feature = edit here
 * + one icon; toolbar/card components stay generic.
 */

import { STEP_LEVEL_LABELS } from "./effect-values";
import type { FeatureId, SteppedFeatureId, ToggleFeatureId } from "./types";

export type FeatureKind = "stepped" | "toggle";

export type A11ySectionId = "display" | "motion-assist";

export type FeatureIconId =
  | FeatureId
  | "sectionDisplay"
  | "sectionMotion"
  | "launcher"
  | "reset"
  | "close";

export type A11yFeatureDef = {
  id: FeatureId;
  section: A11ySectionId;
  kind: FeatureKind;
  labels: { title: string; description: string };
  /** Stepped only — total levels including off/default (0). */
  levels?: number;
  /** Key into FEATURE_ICONS / SECTION_ICONS (React lives in icons.tsx). */
  iconId: FeatureIconId;
  /** Custom properties this feature owns (for cleanup / tests). */
  cssVars?: readonly string[];
  /** Write `data-*` attrs for this feature onto the root. */
  apply: (root: HTMLElement, value: number | boolean) => void;
  /** Live-region announcement for the current value. */
  ariaAnnounce: (value: number | boolean) => string;
};

function announceStepped(
  title: string,
  id: SteppedFeatureId,
  levelIndex: number,
  total: number,
): string {
  const labels = STEP_LEVEL_LABELS[id];
  const name = labels[levelIndex] ?? `Level ${levelIndex + 1}`;
  return `${title}: ${name} (${levelIndex + 1} of ${total})`;
}

function announceToggle(title: string, on: boolean): string {
  return `${title}: ${on ? "on" : "off"}`;
}

function setNum(root: HTMLElement, attr: string, value: number | boolean) {
  root.setAttribute(attr, String(value));
}

function setBool(root: HTMLElement, attr: string, value: number | boolean) {
  root.setAttribute(attr, value ? "1" : "0");
}

export const A11Y_FEATURE_REGISTRY: readonly A11yFeatureDef[] = [
  {
    id: "textSize",
    section: "display",
    kind: "stepped",
    labels: {
      title: "Text Size",
      description: "Adjust reading size",
    },
    levels: 4,
    iconId: "textSize",
    cssVars: ["--itzsa-a11y-font-scale"],
    apply: (root, value) =>
      setNum(root, "data-a11y-text-size", value as number),
    ariaAnnounce: (value) =>
      announceStepped("Text Size", "textSize", value as number, 4),
  },
  {
    id: "textSpacing",
    section: "display",
    kind: "stepped",
    labels: {
      title: "Text Spacing",
      description: "Letter and word spacing",
    },
    levels: 3,
    iconId: "textSpacing",
    cssVars: ["--itzsa-a11y-letter-spacing", "--itzsa-a11y-word-spacing"],
    apply: (root, value) =>
      setNum(root, "data-a11y-text-spacing", value as number),
    ariaAnnounce: (value) =>
      announceStepped("Text Spacing", "textSpacing", value as number, 3),
  },
  {
    id: "lineHeight",
    section: "display",
    kind: "stepped",
    labels: {
      title: "Line Height",
      description: "Space between lines",
    },
    levels: 3,
    iconId: "lineHeight",
    cssVars: ["--itzsa-a11y-line-height"],
    apply: (root, value) =>
      setNum(root, "data-a11y-line-height", value as number),
    ariaAnnounce: (value) =>
      announceStepped("Line Height", "lineHeight", value as number, 3),
  },
  {
    id: "fontSelection",
    section: "display",
    kind: "stepped",
    labels: {
      title: "Font Selection",
      description: "Switch typeface style",
    },
    levels: 3,
    iconId: "fontSelection",
    apply: (root, value) => setNum(root, "data-a11y-font", value as number),
    ariaAnnounce: (value) =>
      announceStepped("Font Selection", "fontSelection", value as number, 3),
  },
  {
    id: "textAlign",
    section: "display",
    kind: "stepped",
    labels: {
      title: "Text Align",
      description: "Left, center, or right",
    },
    levels: 3,
    iconId: "textAlign",
    apply: (root, value) => setNum(root, "data-a11y-align", value as number),
    ariaAnnounce: (value) =>
      announceStepped("Text Align", "textAlign", value as number, 3),
  },
  {
    id: "dyslexiaFriendly",
    section: "display",
    kind: "toggle",
    labels: {
      title: "Dyslexia Friendly",
      description: "Max spacing for reading",
    },
    iconId: "dyslexiaFriendly",
    cssVars: [
      "--itzsa-a11y-letter-spacing",
      "--itzsa-a11y-word-spacing",
      "--itzsa-a11y-line-height",
    ],
    apply: (root, value) => setBool(root, "data-a11y-dyslexia", value),
    ariaAnnounce: (value) =>
      announceToggle("Dyslexia Friendly", Boolean(value)),
  },
  {
    id: "highContrast",
    section: "display",
    kind: "stepped",
    labels: {
      title: "High Contrast",
      description: "Stronger text contrast",
    },
    levels: 3,
    iconId: "highContrast",
    apply: (root, value) => setNum(root, "data-a11y-contrast", value as number),
    ariaAnnounce: (value) =>
      announceStepped("High Contrast", "highContrast", value as number, 3),
  },
  {
    id: "colorFilter",
    section: "display",
    kind: "stepped",
    labels: {
      title: "Color Filter",
      description: "Grayscale, hue, or sepia",
    },
    levels: 4,
    iconId: "colorFilter",
    cssVars: ["--itzsa-a11y-color-filter"],
    apply: (root, value) =>
      setNum(root, "data-a11y-color-filter", value as number),
    ariaAnnounce: (value) =>
      announceStepped("Color Filter", "colorFilter", value as number, 4),
  },
  {
    id: "saturation",
    section: "display",
    kind: "stepped",
    labels: {
      title: "Saturation",
      description: "Reduce or remove color",
    },
    levels: 3,
    iconId: "saturation",
    cssVars: ["--itzsa-a11y-saturation"],
    apply: (root, value) =>
      setNum(root, "data-a11y-saturation", value as number),
    ariaAnnounce: (value) =>
      announceStepped("Saturation", "saturation", value as number, 3),
  },
  {
    id: "hideImages",
    section: "display",
    kind: "toggle",
    labels: {
      title: "Hide Images",
      description: "Hide photos and media",
    },
    iconId: "hideImages",
    apply: (root, value) => setBool(root, "data-a11y-hide-images", value),
    ariaAnnounce: (value) => announceToggle("Hide Images", Boolean(value)),
  },
  {
    id: "highlightLinks",
    section: "display",
    kind: "toggle",
    labels: {
      title: "Highlight Links",
      description: "Emphasize clickable links",
    },
    iconId: "highlightLinks",
    apply: (root, value) => setBool(root, "data-a11y-highlight-links", value),
    ariaAnnounce: (value) => announceToggle("Highlight Links", Boolean(value)),
  },
  {
    id: "pauseAnimations",
    section: "motion-assist",
    kind: "toggle",
    labels: {
      title: "Pause Animations",
      description: "Stop motion and transitions",
    },
    iconId: "pauseAnimations",
    apply: (root, value) => setBool(root, "data-a11y-pause-animations", value),
    ariaAnnounce: (value) => announceToggle("Pause Animations", Boolean(value)),
  },
  {
    id: "biggerCursor",
    section: "motion-assist",
    kind: "toggle",
    labels: {
      title: "Bigger Cursor",
      description: "Enlarge the pointer",
    },
    iconId: "biggerCursor",
    apply: (root, value) => setBool(root, "data-a11y-bigger-cursor", value),
    ariaAnnounce: (value) => announceToggle("Bigger Cursor", Boolean(value)),
  },
  {
    id: "readingGuide",
    section: "motion-assist",
    kind: "toggle",
    labels: {
      title: "Reading Guide",
      description: "Follow-along reading band",
    },
    iconId: "readingGuide",
    apply: (root, value) => setBool(root, "data-a11y-reading-guide", value),
    ariaAnnounce: (value) => announceToggle("Reading Guide", Boolean(value)),
  },
] as const;

export const SECTION_META: Record<
  A11ySectionId,
  { id: A11ySectionId; title: string; iconId: FeatureIconId }
> = {
  display: {
    id: "display",
    title: "Display",
    iconId: "sectionDisplay",
  },
  "motion-assist": {
    id: "motion-assist",
    title: "Motion & assist",
    iconId: "sectionMotion",
  },
};

/** @deprecated Prefer A11Y_FEATURE_REGISTRY */
export const FEATURE_REGISTRY = A11Y_FEATURE_REGISTRY;

export function isSteppedFeature(id: FeatureId): id is SteppedFeatureId {
  return A11Y_FEATURE_REGISTRY.some((f) => f.id === id && f.kind === "stepped");
}

export function isToggleFeature(id: FeatureId): id is ToggleFeatureId {
  return A11Y_FEATURE_REGISTRY.some((f) => f.id === id && f.kind === "toggle");
}

export function getFeatureDef(id: FeatureId): A11yFeatureDef | undefined {
  return A11Y_FEATURE_REGISTRY.find((f) => f.id === id);
}

export function getSectionsWithFeatures(
  enabled?: (id: FeatureId) => boolean,
): Array<{
  id: A11ySectionId;
  title: string;
  iconId: FeatureIconId;
  features: A11yFeatureDef[];
}> {
  return (Object.keys(SECTION_META) as A11ySectionId[])
    .map((key) => {
      const meta = SECTION_META[key];
      const features = A11Y_FEATURE_REGISTRY.filter(
        (f) => f.section === key && (enabled?.(f.id) ?? true),
      );
      return { ...meta, features };
    })
    .filter((s) => s.features.length > 0);
}
