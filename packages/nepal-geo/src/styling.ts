import type * as React from "react";

/** Optional CSS variable overrides (applied on root / popover). */
export type NepalGeoVars = {
  accent?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
  surface?: string;
  radius?: string;
  font?: string;
};

export type NepalGeoClassNames = {
  root?: string;
  trigger?: string;
  label?: string;
  popover?: string;
  search?: string;
  option?: string;
  optionMeta?: string;
  empty?: string;
  clear?: string;
  field?: string;
  cascade?: string;
};

const VAR_MAP: Record<keyof NepalGeoVars, string> = {
  accent: "--geo-accent",
  background: "--geo-bg",
  foreground: "--geo-fg",
  muted: "--geo-muted",
  border: "--geo-border",
  surface: "--geo-surface",
  radius: "--geo-radius",
  font: "--geo-font",
};

/** Merge user `style` with CSS variable overrides from `vars`. */
export function mergeGeoStyle(
  vars?: NepalGeoVars,
  style?: React.CSSProperties,
): React.CSSProperties | undefined {
  if (!vars && !style) return style;
  const next: React.CSSProperties = { ...style };
  if (vars) {
    for (const key of Object.keys(vars) as Array<keyof NepalGeoVars>) {
      const value = vars[key];
      if (value == null || value === "") continue;
      (next as Record<string, string>)[VAR_MAP[key]] = value;
    }
  }
  return next;
}
