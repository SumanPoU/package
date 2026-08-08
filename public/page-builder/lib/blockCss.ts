import type { AdvancedStyle, Block, Device } from '../types';
import {
  buildAdvancedInlineStyle,
  effectiveStyle,
  resolveGridTemplateColumns,
} from './styleBuilder';

export function blockClassName(blockId: string): string {
  return `b-${blockId}`;
}

export function layoutClassName(blockId: string): string {
  return `b-${blockId}-layout`;
}

export function blockSelector(blockId: string): string {
  return `.${blockClassName(blockId)}`;
}

function layoutSelector(blockId: string): string {
  return `.${layoutClassName(blockId)}`;
}

function deviceMediaQuery(device: Device): string {
  if (device === 'desktop') return '@media(min-width:1024px)';
  if (device === 'tablet') return '@media(min-width:640px) and (max-width:1023px)';
  return '@media(max-width:639px)';
}

/** Replaces `.element` with this block's selector. */
export function resolveCustomCssText(raw: string, blockId: string): string {
  const selector = blockSelector(blockId);
  return raw.trim().replace(/\.element\b/g, selector);
}

/**
 * Accepts declaration-only input (`color: red;`) or full rules (`.element { color: red; }`).
 * Never double-wraps when the user already wrote a selector block.
 */
export function formatCustomCssRules(raw: string, blockId: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const resolved = resolveCustomCssText(trimmed, blockId);
  if (resolved.includes('{')) return [resolved];

  return [`${blockSelector(blockId)}{${resolved}}`];
}

export function defaultTextColor(block: Block): string | null {
  const s = block.style;
  if (s.textColor) return null;

  const isDark = s.bg === 'dark' && !s.backgroundColor;

  switch (block.type) {
    case 'heading':
      return isDark ? '#f3f4f6' : '#111827';
    case 'text':
    case 'list':
      return isDark ? '#d1d5db' : '#6b7280';
    case 'button':
      return '#ffffff';
    default:
      return null;
  }
}

export function buildBaseBlockRule(
  block: Block,
  style: AdvancedStyle = block.style,
): string | null {
  let css = buildAdvancedInlineStyle(style);
  const defaultColor = defaultTextColor({ ...block, style });
  if (defaultColor) {
    css = css ? `${css};color:${defaultColor}` : `color:${defaultColor}`;
  }
  return css ? `${blockSelector(block.id)}{${css}}` : null;
}

/**
 * Global `@layer base` in index.css forces `font-family: Outfit` on headings and
 * paragraphs. That blocks inheritance from `.b-{id}` when a custom font is set
 * on the block wrapper. Re-enable cascade for typed text descendants.
 */
export function buildFontInheritRule(
  blockId: string,
  style: Pick<AdvancedStyle, 'fontFamily'>,
): string | null {
  if (!style.fontFamily?.trim()) return null;
  const sel = blockSelector(blockId);
  return `${sel} :is(h1,h2,h3,h4,h5,h6,p,li,blockquote,a,span,button,label){font-family:inherit}`;
}

function buildGridLayoutCssRules(block: Block): string[] {
  if (block.type !== 'grid') return [];

  const rules: string[] = [];
  const sel = layoutSelector(block.id);
  rules.push(`${sel}{grid-template-columns:${resolveGridTemplateColumns(block.style)}}`);

  for (const [dev, override] of Object.entries(block.responsiveStyle) as [
    Device,
    Partial<AdvancedStyle> | undefined,
  ][]) {
    if (!override) continue;
    if (override.columns == null && override.gridTemplateColumns == null) continue;
    const merged = { ...block.style, ...override };
    rules.push(
      `${deviceMediaQuery(dev)}{${sel}{grid-template-columns:${resolveGridTemplateColumns(merged)}}}`,
    );
  }

  return rules;
}

type CollectCssOptions = {
  device?: Device;
  mode: 'export' | 'canvas';
};

export function collectBlockCssRules(block: Block, options: CollectCssOptions): string[] {
  const rules: string[] = [];
  const { mode, device } = options;

  if (mode === 'canvas' && device) {
    const style = effectiveStyle(block, device);
    const base = buildBaseBlockRule(block, style);
    if (base) rules.push(base);
    const fontInherit = buildFontInheritRule(block.id, style);
    if (fontInherit) rules.push(fontInherit);
  } else if (mode === 'export') {
    const base = buildBaseBlockRule(block);
    if (base) rules.push(base);
    const fontInherit = buildFontInheritRule(block.id, block.style);
    if (fontInherit) rules.push(fontInherit);

    const vis = block.visibility;
    if (!vis.desktop) {
      rules.push(`@media(min-width:1024px){${blockSelector(block.id)}{display:none!important}}`);
    }
    if (!vis.tablet) {
      rules.push(
        `@media(min-width:640px) and (max-width:1023px){${blockSelector(block.id)}{display:none!important}}`,
      );
    }
    if (!vis.mobile) {
      rules.push(`@media(max-width:639px){${blockSelector(block.id)}{display:none!important}}`);
    }

    for (const [dev, override] of Object.entries(block.responsiveStyle) as [
      Device,
      Partial<AdvancedStyle>,
    ][]) {
      if (!override) continue;
      const mq = deviceMediaQuery(dev);
      const merged = { ...block.style, ...override };
      const inlineStr = buildAdvancedInlineStyle(merged);
      if (inlineStr) rules.push(`${mq}{${blockSelector(block.id)}{${inlineStr}}}`);
      const fontInheritOverride = buildFontInheritRule(block.id, merged);
      if (fontInheritOverride) rules.push(`${mq}{${fontInheritOverride}}`);
    }

    rules.push(...buildGridLayoutCssRules(block));
  }

  rules.push(...formatCustomCssRules(block.style.customCSS, block.id));

  return rules;
}

export function collectAllBlockCssRules(blocks: Block[], options: CollectCssOptions): string[] {
  const rules: string[] = [];

  function walk(block: Block) {
    rules.push(...collectBlockCssRules(block, options));
    block.children?.forEach(walk);
  }

  blocks.forEach(walk);
  return rules;
}
