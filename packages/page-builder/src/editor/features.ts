export type PageBuilderUiFeatures = {
  /** Show Save in package toolbar. Default: true when onSave provided. */
  showSave?: boolean;
  /** Show Preview. Default: true when onPreview provided. */
  showPreview?: boolean;
  /** Show Open Page. Default: true when onOpenPage provided. */
  showOpenPage?: boolean;
};

export type CanvasMode = "embedded" | "iframe";

/** Host palette filters — hide whole categories and/or individual block types. */
export type PaletteConfig = {
  /** Category ids to hide (e.g. `basic`, `layout`, `presets`, `media`, `embeds`). */
  hideCategories?: string[];
  /** Block type ids to hide (e.g. `heading`, `repeater`). */
  hideBlocks?: string[];
  /** Hide all presets, or specific preset ids. */
  hidePresets?: boolean | string[];
};

export const isCategoryHidden = (
  config: PaletteConfig | undefined,
  category: string,
): boolean => Boolean(config?.hideCategories?.includes(category));

export const isBlockHidden = (
  config: PaletteConfig | undefined,
  type: string,
): boolean => Boolean(config?.hideBlocks?.includes(type));

export const isPresetHidden = (
  config: PaletteConfig | undefined,
  presetId: string,
): boolean => {
  if (!config?.hidePresets) return false;
  if (config.hidePresets === true) return true;
  return config.hidePresets.includes(presetId);
};
