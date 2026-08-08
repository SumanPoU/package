import type { Block } from "../core/types";

/** Insertable recipe — expands to a normal nested primitive tree (ADR-07). */
export type PresetDefinition = {
  id: string;
  label: string;
  description?: string;
  /** Build a fresh root block (new ids every call). */
  create: () => Block;
};

export const PRESET_CATEGORY = "presets" as const;
