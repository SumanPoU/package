import type * as React from "react";

/**
 * Optional CSS variable overrides applied on the root / popover.
 * Prefer these over forking styles.css.
 */
export type NepaliDatePickerVars = {
  accent?: string;
  accentForeground?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  border?: string;
  surface?: string;
  radius?: string;
  font?: string;
};

export type NepaliDatePickerClassNames = {
  root?: string;
  field?: string;
  input?: string;
  trigger?: string;
  popover?: string;
  day?: string;
  daySelected?: string;
  footer?: string;
};

export type NepaliDateRangeClassNames = NepaliDatePickerClassNames & {
  rangeTrigger?: string;
  rangeLabel?: string;
  rangeMonths?: string;
};

const VAR_MAP: Record<keyof NepaliDatePickerVars, string> = {
  accent: "--ndp-accent",
  accentForeground: "--ndp-accent-fg",
  background: "--ndp-bg",
  foreground: "--ndp-fg",
  muted: "--ndp-muted",
  border: "--ndp-border",
  surface: "--ndp-surface",
  radius: "--ndp-radius",
  font: "--ndp-font",
};

/** Merge user `style` with CSS variable overrides from `vars`. */
export function mergePickerStyle(
  vars?: NepaliDatePickerVars,
  style?: React.CSSProperties,
): React.CSSProperties | undefined {
  if (!vars && !style) return style;
  const next: React.CSSProperties = { ...style };
  if (vars) {
    for (const key of Object.keys(vars) as Array<keyof NepaliDatePickerVars>) {
      const value = vars[key];
      if (value == null || value === "") continue;
      (next as Record<string, string>)[VAR_MAP[key]] = value;
    }
  }
  return next;
}
