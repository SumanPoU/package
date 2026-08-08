import type { Block } from '../types';
import {
  DEFAULT_STYLE,
  DEFAULT_VISIBILITY,
  makeDefaultBorderRadius,
  makeDefaultBoxShadow,
  makeDefaultSpacing,
  COMPONENT_LIBRARY,
} from '../constants';
import type {
  AdvancedStyle,
  Device,
  DeviceVisibility,
  I18nProps,
  ResponsiveOverrides,
} from '../types';
import { nanoid } from './ids';
import { buildInitialI18nProps, resolveProps } from './i18nResolve';

export function createBlock(def: (typeof COMPONENT_LIBRARY)[number], currentLang: string): Block {
  const i18nProps = buildInitialI18nProps(def.type, def.defaultProps, currentLang);
  return {
    id: nanoid(),
    type: def.type,
    props: { ...def.defaultProps },
    i18nProps,
    style: {
      ...DEFAULT_STYLE,
      ...(def.defaultStyle ?? {}),
      margin: makeDefaultSpacing(),
      padding: makeDefaultSpacing(),
      borderWidth: makeDefaultSpacing(),
      borderRadius: makeDefaultBorderRadius(),
      boxShadow: makeDefaultBoxShadow(),
    },
    visibility: { ...DEFAULT_VISIBILITY },
    responsiveStyle: {},
    children: def.isContainer ? [] : undefined,
  };
}

export function findBlock(blocks: Block[], id: string): Block | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const f = findBlock(b.children, id);
      if (f) return f;
    }
  }
  return null;
}

export function removeBlockFromTree(
  blocks: Block[],
  id: string,
): { tree: Block[]; removed: Block | null } {
  let removed: Block | null = null;
  const recurse = (list: Block[]): Block[] =>
    list.flatMap((b) => {
      if (b.id === id) {
        removed = b;
        return [];
      }
      return [b.children ? { ...b, children: recurse(b.children) } : b];
    });
  return { tree: recurse(blocks), removed };
}

export function insertBlockInTree(
  blocks: Block[],
  containerId: string,
  index: number,
  block: Block,
): Block[] {
  if (containerId === 'root') {
    const c = [...blocks];
    c.splice(index, 0, block);
    return c;
  }
  return blocks.map((b) => {
    if (b.id === containerId && b.children) {
      const c = [...b.children];
      c.splice(index, 0, block);
      return { ...b, children: c };
    }
    if (b.children)
      return { ...b, children: insertBlockInTree(b.children, containerId, index, block) };
    return b;
  });
}

export function getChildrenIds(blocks: Block[], containerId: string): string[] {
  if (containerId === 'root') return blocks.map((b) => b.id);
  return findBlock(blocks, containerId)?.children?.map((c) => c.id) ?? [];
}

export function isDescendant(blocks: Block[], ancestorId: string, targetId: string): boolean {
  const node = findBlock(blocks, ancestorId);
  if (!node?.children) return false;
  return node.children.some((c) => c.id === targetId || isDescendant(blocks, c.id, targetId));
}

export function updateBlockInTree(
  blocks: Block[],
  id: string,
  updater: (b: Block) => Block,
): Block[] {
  return blocks.map((b) => {
    if (b.id === id) return updater(b);
    if (b.children) return { ...b, children: updateBlockInTree(b.children, id, updater) };
    return b;
  });
}

export function updateBlockI18nInTree(
  blocks: Block[],
  id: string,
  i18nProps: I18nProps,
  currentLang: string,
): Block[] {
  return updateBlockInTree(blocks, id, (b) => {
    const resolved = resolveProps({ ...b, i18nProps }, currentLang);
    return { ...b, i18nProps, props: resolved };
  });
}

export function updateBlockStyleInTree(blocks: Block[], id: string, style: AdvancedStyle): Block[] {
  return updateBlockInTree(blocks, id, (b) => ({ ...b, style }));
}

export function updateBlockVisibilityInTree(
  blocks: Block[],
  id: string,
  visibility: DeviceVisibility,
): Block[] {
  return updateBlockInTree(blocks, id, (b) => ({ ...b, visibility }));
}

export function updateBlockResponsiveStyleInTree(
  blocks: Block[],
  id: string,
  responsiveStyle: ResponsiveOverrides,
): Block[] {
  return updateBlockInTree(blocks, id, (b) => ({ ...b, responsiveStyle }));
}
