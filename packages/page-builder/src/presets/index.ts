import { cardPreset } from "./card";
import { heroPreset } from "./hero";
import { iconBoxPreset } from "./icon-box";
import { imageBoxPreset } from "./image-box";
import { testimonialPreset } from "./testimonial";
import type { PresetDefinition } from "./types";

export const CORE_PRESETS: readonly PresetDefinition[] = [
  cardPreset,
  heroPreset,
  iconBoxPreset,
  imageBoxPreset,
  testimonialPreset,
] as const;

export const getPreset = (id: string): PresetDefinition | undefined =>
  CORE_PRESETS.find((p) => p.id === id);

export const listPresets = (): PresetDefinition[] => [...CORE_PRESETS];

export { cardPreset, createCardPreset } from "./card";
export { createHeroPreset, heroPreset } from "./hero";
export { createIconBoxPreset, iconBoxPreset } from "./icon-box";
export { createImageBoxPreset, imageBoxPreset } from "./image-box";
export { createTestimonialPreset, testimonialPreset } from "./testimonial";
export type { PresetDefinition } from "./types";
export { PRESET_CATEGORY } from "./types";
