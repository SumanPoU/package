import { useCallback } from "react";
import {
  cloneBlock,
  findBlock,
  findBlockPath,
  insertBlock,
  removeBlock,
} from "../../core/blockTree";
import {
  copyBlockToClipboard,
  cutBlockToClipboard,
  takePasteClone,
} from "../../core/clipboard";
import type { BlockRegistry } from "../../core/registry";
import type { Block, Page } from "../../core/types";

export type UseClipboardOptions = {
  page: Page;
  selectedId: string | null;
  registry: BlockRegistry;
  push: (page: Page) => void;
  onSelect?: (id: string | null) => void;
};

export const useClipboard = ({
  page,
  selectedId,
  registry,
  push,
  onSelect,
}: UseClipboardOptions) => {
  const copy = useCallback(() => {
    if (!selectedId) return;
    const block = findBlock(page.blocks, selectedId);
    if (!block) return;
    copyBlockToClipboard(block);
  }, [page.blocks, selectedId]);

  const cut = useCallback(() => {
    if (!selectedId) return;
    const block = findBlock(page.blocks, selectedId);
    if (!block) return;
    cutBlockToClipboard(block);
    try {
      const nextBlocks = removeBlock(page.blocks, selectedId);
      push({ ...page, blocks: nextBlocks });
      onSelect?.(null);
    } catch {
      // no-op
    }
  }, [onSelect, page, push, selectedId]);

  const paste = useCallback(() => {
    const clone = takePasteClone();
    if (!clone) return;

    let parentId: string | null = null;
    let index: number | undefined;

    if (selectedId) {
      const selected = findBlock(page.blocks, selectedId);
      const def = selected ? registry.get(selected.type) : undefined;
      if (
        selected &&
        def?.isContainer &&
        (def.canAcceptChild?.(clone.type) ?? true)
      ) {
        parentId = selected.id;
        index = selected.children?.length ?? 0;
      } else {
        const path = findBlockPath(page.blocks, selectedId);
        if (path) {
          parentId = path.parent?.id ?? null;
          index = path.index + 1;
          if (path.parent) {
            const parentDef = registry.get(path.parent.type);
            if (
              parentDef?.canAcceptChild &&
              !parentDef.canAcceptChild(clone.type)
            ) {
              parentId = null;
              index = undefined;
            }
          }
        }
      }
    }

    try {
      const nextBlocks = insertBlock(page.blocks, clone, parentId, index);
      push({ ...page, blocks: nextBlocks });
      onSelect?.(clone.id);
    } catch {
      // invalid target — no-op
    }
  }, [onSelect, page, push, registry, selectedId]);

  const duplicate = useCallback(() => {
    if (!selectedId) return;
    const block = findBlock(page.blocks, selectedId);
    if (!block) return;
    const clone = cloneBlock(block);
    const path = findBlockPath(page.blocks, selectedId);
    if (!path) return;
    const parentId = path.parent?.id ?? null;
    try {
      const nextBlocks = insertBlock(
        page.blocks,
        clone,
        parentId,
        path.index + 1,
      );
      push({ ...page, blocks: nextBlocks });
      onSelect?.(clone.id);
    } catch {
      // no-op
    }
  }, [onSelect, page, push, selectedId]);

  return { copy, cut, paste, duplicate };
};

export type { Block };
