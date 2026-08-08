import type React from 'react';

import type { TextStyle } from './blog-card.types';

const CARD_SHADOW: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
};

const CARD_SHADOW_HOVER: Record<'sm' | 'md' | 'lg', string> = {
  sm: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export function parseTextStyle(value: unknown): TextStyle {
  if (value == null || value === '') return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as TextStyle;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as TextStyle;
      }
    } catch {
      return {};
    }
  }
  return {};
}

/** Quote multi-word font names so `Open Sans` / `Playfair Display` are valid CSS. */
export function toCssFontFamily(fontFamily: string): string {
  const name = fontFamily.trim();
  if (!name) return '';
  if (name.includes('"') || name.includes("'") || name.includes(',')) return name;
  if (/\s/.test(name)) return `"${name}"`;
  return name;
}

export function textStyleToCss(style: TextStyle | unknown): React.CSSProperties {
  const s = parseTextStyle(style);
  const css: React.CSSProperties = {};
  if (s.color) css.color = s.color;
  if (s.fontFamily) css.fontFamily = toCssFontFamily(s.fontFamily);
  if (s.fontSize) css.fontSize = s.fontSize;
  if (s.fontWeight) css.fontWeight = s.fontWeight as React.CSSProperties['fontWeight'];
  if (s.fontStyle) css.fontStyle = s.fontStyle as React.CSSProperties['fontStyle'];
  if (s.textAlign) css.textAlign = s.textAlign;
  if (s.textTransform) css.textTransform = s.textTransform;
  if (s.letterSpacing) css.letterSpacing = s.letterSpacing;
  if (s.lineHeight) css.lineHeight = s.lineHeight;
  return css;
}

export function textStyleToInlineCssString(style: TextStyle | unknown): string {
  const css = textStyleToCss(style);
  return Object.entries(css)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`)
    .join(';');
}

export function cardShadowToCss(shadow: string | undefined): string {
  if (shadow === 'sm' || shadow === 'md' || shadow === 'lg') return CARD_SHADOW[shadow];
  if (shadow === 'none') return CARD_SHADOW.none;
  return CARD_SHADOW.sm;
}

export function cardShadowHoverCss(
  shadow: string | undefined,
  hoverEffect: string | undefined,
): string | undefined {
  if (hoverEffect !== 'lift' && hoverEffect !== 'shadow-grow') return undefined;
  if (shadow === 'sm' || shadow === 'md' || shadow === 'lg') return CARD_SHADOW_HOVER[shadow];
  return CARD_SHADOW.md;
}

export function stringifyTextStyle(style: TextStyle): string {
  return JSON.stringify(style);
}
