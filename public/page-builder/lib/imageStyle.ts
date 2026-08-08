import type { AdvancedStyle, BoxShadow } from '../types';
import type React from 'react';

export type ImageObjectFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
export type ImageShadowPreset = 'none' | 'soft' | 'medium' | 'strong' | 'custom';

export const IMAGE_OBJECT_FIT_OPTIONS: { value: ImageObjectFit; label: string }[] = [
  { value: 'fill', label: 'Fill' },
  { value: 'contain', label: 'Contain' },
  { value: 'cover', label: 'Cover' },
  { value: 'none', label: 'Fit Content' },
  { value: 'scale-down', label: 'Scale Down' },
];

export const IMAGE_SHADOW_PRESETS: Record<
  Exclude<ImageShadowPreset, 'none' | 'custom'>,
  BoxShadow
> = {
  soft: {
    enabled: true,
    x: '0',
    y: '2',
    blur: '8',
    spread: '0',
    color: '#0000001a',
    inset: false,
  },
  medium: {
    enabled: true,
    x: '0',
    y: '4',
    blur: '16',
    spread: '0',
    color: '#00000026',
    inset: false,
  },
  strong: {
    enabled: true,
    x: '0',
    y: '8',
    blur: '32',
    spread: '0',
    color: '#00000040',
    inset: false,
  },
};

export function normalizeObjectFit(value?: string): ImageObjectFit {
  if (IMAGE_OBJECT_FIT_OPTIONS.some((opt) => opt.value === value)) {
    return value as ImageObjectFit;
  }
  return 'cover';
}

export function normalizeImageShadowPreset(value?: string): ImageShadowPreset {
  if (value === 'soft' || value === 'medium' || value === 'strong' || value === 'custom') {
    return value;
  }
  return 'none';
}

function boxShadowToCss(shadow: BoxShadow): string {
  return `${shadow.inset ? 'inset ' : ''}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}

export function resolveImageBoxShadow(style: AdvancedStyle): string | undefined {
  const preset = normalizeImageShadowPreset(style.imageShadowPreset);

  if (preset === 'custom') {
    return style.boxShadow.enabled ? boxShadowToCss(style.boxShadow) : undefined;
  }

  if (preset === 'none') return undefined;

  return boxShadowToCss(IMAGE_SHADOW_PRESETS[preset]);
}

export function buildImageElementCss(style: AdvancedStyle): string {
  const parts: string[] = [];

  parts.push(`object-fit:${normalizeObjectFit(style.objectFit)}`);

  const blur = parseFloat(style.filterBlur ?? '');
  if (!Number.isNaN(blur) && blur > 0) {
    parts.push(`filter:blur(${blur}px)`);
  }

  const shadow = resolveImageBoxShadow(style);
  if (shadow) parts.push(`box-shadow:${shadow}`);

  return parts.join(';');
}

export function buildImageElementStyle(style: AdvancedStyle): React.CSSProperties {
  const css: React.CSSProperties = {
    objectFit: normalizeObjectFit(style.objectFit),
  };

  const blur = parseFloat(style.filterBlur ?? '');
  if (!Number.isNaN(blur) && blur > 0) {
    css.filter = `blur(${blur}px)`;
  }

  const shadow = resolveImageBoxShadow(style);
  if (shadow) css.boxShadow = shadow;

  return css;
}
