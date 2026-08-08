import type { Block } from "./types";

export type BlockPath = {
  parent: Block | null;
  index: number;
  block: Block;
};

const createId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // ponytail: ceiling = non-crypto fallback for rare hosts without crypto.randomUUID
  return `pb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

const mapTree = (
  blocks: Block[],
  fn: (block: Block) => Block | null,
): Block[] => {
  const out: Block[] = [];
  for (const block of blocks) {
    const next = fn(block);
    if (next === null) continue;
    out.push(next);
  }
  return out;
};

export const findBlock = (blocks: Block[], id: string): Block | undefined => {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children?.length) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
    if (block.dataBinding?.itemTemplate?.length) {
      const found = findBlock(block.dataBinding.itemTemplate, id);
      if (found) return found;
    }
  }
  return undefined;
};

export const findBlockPath = (
  blocks: Block[],
  id: string,
  parent: Block | null = null,
): BlockPath | undefined => {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]!;
    if (block.id === id) return { parent, index, block };
    if (block.children?.length) {
      const found = findBlockPath(block.children, id, block);
      if (found) return found;
    }
  }
  return undefined;
};

export const cloneBlock = (block: Block): Block => {
  const cloned: Block = {
    ...block,
    id: createId(),
    props: { ...block.props },
    i18nProps: block.i18nProps
      ? Object.fromEntries(
          Object.entries(block.i18nProps).map(([locale, slice]) => [
            locale,
            { ...slice },
          ]),
        )
      : undefined,
    children: block.children?.map(cloneBlock),
    dataBinding: block.dataBinding
      ? {
          ...block.dataBinding,
          params: { ...block.dataBinding.params },
          itemTemplate: block.dataBinding.itemTemplate.map(cloneBlock),
        }
      : undefined,
    visibility: block.visibility ? { ...block.visibility } : undefined,
    visibleWhen: block.visibleWhen
      ? {
          allOf: block.visibleWhen.allOf?.map((p) => ({ ...p })),
          anyOf: block.visibleWhen.anyOf?.map((p) => ({ ...p })),
        }
      : undefined,
    customJs: block.customJs ? { ...block.customJs } : undefined,
    style: block.style ? { ...block.style } : undefined,
    responsiveStyle: block.responsiveStyle
      ? { ...block.responsiveStyle }
      : undefined,
  };
  return cloned;
};

const insertIntoList = (
  list: Block[],
  block: Block,
  index: number | undefined,
): Block[] => {
  const at =
    index === undefined || index < 0 || index > list.length
      ? list.length
      : index;
  return [...list.slice(0, at), block, ...list.slice(at)];
};

/**
 * Insert a block at root (`parentId` null) or as a child of `parentId`.
 * Creates `children` on the parent when missing.
 */
export const insertBlock = (
  blocks: Block[],
  block: Block,
  parentId: string | null = null,
  index?: number,
): Block[] => {
  if (parentId === null) {
    return insertIntoList(blocks, block, index);
  }

  let inserted = false;

  const walk = (list: Block[]): Block[] =>
    list.map((node) => {
      if (node.id === parentId) {
        inserted = true;
        return {
          ...node,
          children: insertIntoList(node.children ?? [], block, index),
        };
      }
      if (!node.children?.length) return node;
      return { ...node, children: walk(node.children) };
    });

  const next = walk(blocks);
  if (!inserted) {
    throw new Error(`insertBlock: parent "${parentId}" not found`);
  }
  return next;
};

export const removeBlock = (blocks: Block[], id: string): Block[] => {
  const path = findBlockPath(blocks, id);
  if (!path) {
    throw new Error(`removeBlock: block "${id}" not found`);
  }

  const strip = (list: Block[]): Block[] =>
    mapTree(list, (node) => {
      if (node.id === id) return null;
      if (!node.children?.length) return node;
      return { ...node, children: strip(node.children) };
    });

  return strip(blocks);
};

export const updateBlock = (
  blocks: Block[],
  id: string,
  updater: (block: Block) => Block,
): Block[] => {
  let updated = false;

  const walk = (list: Block[]): Block[] =>
    list.map((node) => {
      if (node.id === id) {
        updated = true;
        return updater(node);
      }
      if (!node.children?.length) return node;
      return { ...node, children: walk(node.children) };
    });

  const next = walk(blocks);
  if (!updated) {
    throw new Error(`updateBlock: block "${id}" not found`);
  }
  return next;
};

/**
 * Move a block to a new parent (null = root) at `index`.
 * Refuses cycles (moving a node under itself or a descendant).
 */
export const moveBlock = (
  blocks: Block[],
  id: string,
  newParentId: string | null,
  index?: number,
): Block[] => {
  const path = findBlockPath(blocks, id);
  if (!path) {
    throw new Error(`moveBlock: block "${id}" not found`);
  }

  if (newParentId === id) {
    throw new Error("moveBlock: cannot move a block into itself");
  }

  if (newParentId !== null) {
    const parent = findBlock(blocks, newParentId);
    if (!parent) {
      throw new Error(`moveBlock: parent "${newParentId}" not found`);
    }
    // Cycle: if newParent is under the moving block's subtree
    if (findBlock(path.block.children ?? [], newParentId)) {
      throw new Error("moveBlock: cannot move a block under its descendant");
    }
  }

  const without = removeBlock(blocks, id);
  return insertBlock(without, path.block, newParentId, index);
};

/**
 * Move a block one step among its siblings (`-1` up, `+1` down).
 * No-op (returns same tree) when already at the edge.
 */
export const moveBlockByDelta = (
  blocks: Block[],
  id: string,
  delta: -1 | 1,
): Block[] => {
  const path = findBlockPath(blocks, id);
  if (!path) {
    throw new Error(`moveBlockByDelta: block "${id}" not found`);
  }
  const siblings = path.parent?.children ?? blocks;
  const nextIndex = path.index + delta;
  if (nextIndex < 0 || nextIndex >= siblings.length) {
    return blocks;
  }
  return moveBlock(blocks, id, path.parent?.id ?? null, nextIndex);
};

export const createBlockId = createId;

/** Child ids of a container, or root list when `containerId === "root"`. */
export const getChildrenIds = (
  blocks: Block[],
  containerId: string,
): string[] => {
  if (containerId === "root") return blocks.map((b) => b.id);
  const container = findBlock(blocks, containerId);
  return container?.children?.map((b) => b.id) ?? [];
};

/** True if `maybeDescendantId` is under `ancestorId` (not including self). */
export const isDescendant = (
  blocks: Block[],
  ancestorId: string,
  maybeDescendantId: string,
): boolean => {
  const ancestor = findBlock(blocks, ancestorId);
  if (!ancestor?.children?.length) return false;
  if (ancestor.children.some((c) => c.id === maybeDescendantId)) return true;
  return ancestor.children.some((c) =>
    isDescendant(blocks, c.id, maybeDescendantId),
  );
};

export const createBlockFromDefinition = (def: {
  type: string;
  defaultProps: Record<string, unknown>;
  defaultI18nProps?: Block["i18nProps"];
  isContainer?: boolean;
}): Block => ({
  id: createId(),
  type: def.type,
  props: { ...def.defaultProps },
  i18nProps: def.defaultI18nProps
    ? (JSON.parse(JSON.stringify(def.defaultI18nProps)) as Block["i18nProps"])
    : undefined,
  children: def.isContainer ? [] : undefined,
});
