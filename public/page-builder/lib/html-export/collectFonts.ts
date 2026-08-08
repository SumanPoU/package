import type { Block, Device } from '../../types';

function addFontFamily(value: unknown, usedFonts: Set<string>) {
  if (!value) return;
  if (typeof value === 'object' && !Array.isArray(value)) {
    const family = (value as { fontFamily?: unknown }).fontFamily;
    if (typeof family === 'string' && family.trim()) usedFonts.add(family.trim());
    return;
  }
  if (typeof value !== 'string' || !value.trim().startsWith('{')) return;
  try {
    const parsed: unknown = JSON.parse(value);
    addFontFamily(parsed, usedFonts);
  } catch {
    // Not a style JSON blob — ignore.
  }
}

export function collectFonts(blocks: Block[]) {
  const usedFonts = new Set<string>();
  const collect = (tree: Block[]) => {
    tree.forEach((b) => {
      if (b.style?.fontFamily) usedFonts.add(b.style.fontFamily);
      (['desktop', 'tablet', 'mobile'] as Device[]).forEach((d) => {
        const dStyle = b.responsiveStyle?.[d];
        if (dStyle?.fontFamily) usedFonts.add(dStyle.fontFamily);
      });
      for (const value of Object.values(b.props ?? {})) addFontFamily(value, usedFonts);
      if (b.children) collect(b.children);
    });
  };
  collect(blocks);
  return usedFonts;
}
