/**
 * Feature registry — single place to add/remove toolbar controls.
 * Keeps UI sections, labels, and step counts aligned as the package scales.
 */

import type { FeatureId, SteppedFeatureId, ToggleFeatureId } from "./types";

export type FeatureKind = "step" | "toggle";

export type FeatureDefinition = {
  id: FeatureId;
  kind: FeatureKind;
  /** Panel section bucket */
  section: "content" | "vision" | "assist";
  /** Stepped controls only */
  steps?: number;
};

export const FEATURE_REGISTRY: readonly FeatureDefinition[] = [
  { id: "textSize", kind: "step", section: "content", steps: 4 },
  { id: "textSpacing", kind: "step", section: "content", steps: 3 },
  { id: "lineHeight", kind: "step", section: "content", steps: 3 },
  { id: "fontSelection", kind: "step", section: "content", steps: 3 },
  { id: "textAlign", kind: "step", section: "content", steps: 3 },
  { id: "dyslexiaFriendly", kind: "toggle", section: "content" },
  { id: "highContrast", kind: "step", section: "vision", steps: 3 },
  { id: "colorFilter", kind: "step", section: "vision", steps: 4 },
  { id: "saturation", kind: "step", section: "vision", steps: 3 },
  { id: "hideImages", kind: "toggle", section: "vision" },
  { id: "highlightLinks", kind: "toggle", section: "vision" },
  { id: "pauseAnimations", kind: "toggle", section: "assist" },
  { id: "biggerCursor", kind: "toggle", section: "assist" },
  { id: "readingGuide", kind: "toggle", section: "assist" },
] as const;

export const SECTION_META: Record<
  FeatureDefinition["section"],
  { id: string; title: string }
> = {
  content: { id: "content", title: "Content" },
  vision: { id: "vision", title: "Color & vision" },
  assist: { id: "assist", title: "Motion & assist" },
};

export function isSteppedFeature(id: FeatureId): id is SteppedFeatureId {
  return FEATURE_REGISTRY.some((f) => f.id === id && f.kind === "step");
}

export function isToggleFeature(id: FeatureId): id is ToggleFeatureId {
  return FEATURE_REGISTRY.some((f) => f.id === id && f.kind === "toggle");
}

export function getFeatureDef(id: FeatureId): FeatureDefinition | undefined {
  return FEATURE_REGISTRY.find((f) => f.id === id);
}
