import React from 'react';
import type { AdvancedStyle, Block, Device, DimensionValue } from '../types';

export function buildAdvancedInlineStyle(s: AdvancedStyle): string {
  const parts: string[] = [];

  // Dimensions
  const setDim = (key: string, d?: DimensionValue) => {
    if (d && d.unit !== 'auto' && d.value !== null) parts.push(`${key}:${d.value}${d.unit}`);
  };
  setDim('width', s.dimWidth);
  setDim('height', s.dimHeight);
  setDim('min-width', s.minWidth);
  setDim('max-width', s.maxWidth);
  setDim('min-height', s.minHeight);
  setDim('max-height', s.maxHeight);

  // Fallback to legacy dimensions if new ones aren't set
  if (!s.dimHeight || (s.dimHeight.unit === 'auto' && s.height)) {
    if (s.height === 'full') {
      parts.push('height:100%');
    } else if (s.height === 'custom' && s.customHeight) {
      parts.push(`height:${s.customHeight}px`);
    }
  }

  // Margin
  const m = s.margin;
  if (m.top) parts.push(`margin-top:${m.top}${m.unit}`);
  if (m.right) parts.push(`margin-right:${m.right}${m.unit}`);
  if (m.bottom) parts.push(`margin-bottom:${m.bottom}${m.unit}`);
  if (m.left) parts.push(`margin-left:${m.left}${m.unit}`);

  // Padding from advanced inputs (overrides quick presets if set)
  const p = s.padding;
  if (p.top || p.right || p.bottom || p.left) {
    if (p.top) parts.push(`padding-top:${p.top}${p.unit}`);
    if (p.right) parts.push(`padding-right:${p.right}${p.unit}`);
    if (p.bottom) parts.push(`padding-bottom:${p.bottom}${p.unit}`);
    if (p.left) parts.push(`padding-left:${p.left}${p.unit}`);
  } else {
    // Fall back to quick preset
    const padMap: Record<string, string> = { none: '0', sm: '12px', md: '32px', lg: '64px' };
    const pad = padMap[s.paddingY] ?? '0';
    if (pad !== '0') parts.push(`padding-top:${pad}`, `padding-bottom:${pad}`);
  }

  // Typography
  if (s.fontFamily) {
    const name = s.fontFamily.trim();
    const family =
      !name || name.includes('"') || name.includes("'") || name.includes(',')
        ? name
        : /\s/.test(name)
          ? `"${name}"`
          : name;
    if (family) parts.push(`font-family:${family}`);
  }
  if (s.fontSize) parts.push(`font-size:${s.fontSize}${s.fontSizeUnit}`);
  if (s.fontWeight) parts.push(`font-weight:${s.fontWeight}`);
  if (s.lineHeight) parts.push(`line-height:${s.lineHeight}`);
  if (s.letterSpacing) parts.push(`letter-spacing:${s.letterSpacing}${s.letterSpacingUnit}`);
  if (s.textTransform !== 'none') parts.push(`text-transform:${s.textTransform}`);
  if (s.textDecoration !== 'none') parts.push(`text-decoration:${s.textDecoration}`);
  if (s.textColor) parts.push(`color:${s.textColor}`);

  // Background
  const bgLayers: string[] = [];
  if (s.backgroundOverlay && s.backgroundImage) {
    const { opacity } = s.backgroundOverlay;
    bgLayers.push(`linear-gradient(rgba(0,0,0,${opacity}), rgba(0,0,0,${opacity}))`);
  }

  if (s.backgroundImage) {
    bgLayers.push(`url(${s.backgroundImage})`);
  }

  if (bgLayers.length > 0) {
    parts.push(`background-image:${bgLayers.join(', ')}`);
    if (s.backgroundSize) parts.push(`background-size:${s.backgroundSize}`);
    if (s.backgroundPosition) parts.push(`background-position:${s.backgroundPosition}`);
    if (s.backgroundRepeat) parts.push(`background-repeat:${s.backgroundRepeat}`);
  }

  if (s.backgroundColor) parts.push(`background-color:${s.backgroundColor}`);
  else if (!s.backgroundImage) {
    const bgMap: Record<string, string> = { none: '', gray: '#f9fafb', dark: '#111827' };
    if (bgMap[s.bg]) parts.push(`background-color:${bgMap[s.bg]}`);
  }

  // Text alignment
  const alignMap: Record<string, string> = { left: 'left', center: 'center', right: 'right' };
  if (s.align !== 'left') parts.push(`text-align:${alignMap[s.align]}`);

  // Border
  const bw = s.borderWidth;
  if (s.borderStyle !== 'none') {
    const hasSide = bw.top || bw.right || bw.bottom || bw.left;
    if (hasSide) {
      if (bw.top) parts.push(`border-top:${bw.top}${bw.unit} ${s.borderStyle} ${s.borderColor}`);
      if (bw.right)
        parts.push(`border-right:${bw.right}${bw.unit} ${s.borderStyle} ${s.borderColor}`);
      if (bw.bottom)
        parts.push(`border-bottom:${bw.bottom}${bw.unit} ${s.borderStyle} ${s.borderColor}`);
      if (bw.left) parts.push(`border-left:${bw.left}${bw.unit} ${s.borderStyle} ${s.borderColor}`);
    } else {
      parts.push(`border:1px ${s.borderStyle} ${s.borderColor}`);
    }
  }

  // Border radius
  const br = s.borderRadius;
  if (br.topLeft || br.topRight || br.bottomRight || br.bottomLeft) {
    const u = br.unit;
    parts.push(
      `border-radius:${br.topLeft || 0}${u} ${br.topRight || 0}${u} ${br.bottomRight || 0}${u} ${br.bottomLeft || 0}${u}`,
    );
  }

  // Opacity
  if (s.opacity !== '') parts.push(`opacity:${parseFloat(s.opacity) / 100}`);

  // Box shadow
  if (s.boxShadow.enabled) {
    const { x, y, blur, spread, color, inset } = s.boxShadow;
    parts.push(`box-shadow:${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}`);
  }

  return parts.join(';');
}

export function effectiveStyle(block: Block, device: Device): AdvancedStyle {
  return { ...block.style, ...(block.responsiveStyle[device] ?? {}) };
}

/** Equal-width template from column count, or an explicit template (e.g. sidebar layouts). */
export function resolveGridTemplateColumns(
  s: Pick<AdvancedStyle, 'columns' | 'gridTemplateColumns'>,
): string {
  return s.gridTemplateColumns ?? `repeat(${s.columns ?? 2},1fr)`;
}

export function getInheritStyle(s: AdvancedStyle): React.CSSProperties {
  const st: React.CSSProperties = {};
  const isDark = s.bg === 'dark' && !s.backgroundColor;
  // Always inherit font-family so global `h1–h6`/`p{font-family:Outfit}` rules
  // cannot override a custom font set on the block wrapper (`.b-{id}`).
  st.fontFamily = 'inherit';
  if (s.fontSize) st.fontSize = 'inherit';
  if (s.fontWeight) st.fontWeight = 'inherit';
  if (s.lineHeight) st.lineHeight = 'inherit';
  if (s.textColor || isDark) st.color = 'inherit';
  if (s.letterSpacing) st.letterSpacing = 'inherit';
  if (s.textTransform !== 'none') st.textTransform = 'inherit';
  if (s.textDecoration !== 'none') st.textDecoration = 'inherit';
  return st;
}
