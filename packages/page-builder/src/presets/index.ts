import { cardPreset } from "./card";
import { heroPreset } from "./hero";
import type { PresetDefinition } from "./types";

export const CORE_PRESETS: readonly PresetDefinition[] = [
  cardPreset,
  heroPreset,
] as const;

export const getPreset = (id: string): PresetDefinition | undefined =>
  CORE_PRESETS.find((p) => p.id === id);

export const listPresets = (): PresetDefinition[] => [...CORE_PRESETS];

export { cardPreset, createCardPreset } from "./card";
export { createHeroPreset, heroPreset } from "./hero";
export type { PresetDefinition } from "./types";
export { PRESET_CATEGORY } from "./types";
