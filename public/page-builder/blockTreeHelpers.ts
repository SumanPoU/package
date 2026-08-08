import type { Block } from './types';
import { nanoid, resolveProps } from './utils';
import { isRegisteredBlockType } from './core/registry';

export function resolveBlockTree(block: Block, lang: string): Block {
  const resolved = resolveProps(block, lang);
  return {
    ...block,
    props: resolved,
    children: block.children?.map((c) => resolveBlockTree(c, lang)),
  };
}

export function cloneBlock(b: Block): Block {
  return {
    ...b,
    id: nanoid(),
    children: b.children?.map(cloneBlock),
  };
}

export function parseStoredBlocks(raw: string | null | undefined): unknown[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Page content must be a JSON array of blocks.');
    }
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Page content is not valid JSON.');
    }
    throw error;
  }
}

export function stripUnregisteredBlockTypes(blocks: Block[]): Block[] {
  return blocks
    .filter((block) => {
      if (!isRegisteredBlockType(block.type)) {
        if (import.meta.env.DEV) {
          console.warn(
            `[page-builder] Skipping unregistered block type "${block.type}" during load.`,
          );
        }
        return false;
      }
      return true;
    })
    .map((block) => ({
      ...block,
      children: block.children ? stripUnregisteredBlockTypes(block.children) : undefined,
    }));
}
