import { useCallback, useEffect, useRef, useState } from "react";

import {
  createBlockFromDefinition,
  findBlock,
  getChildrenIds,
  insertBlock,
  isDescendant,
  removeBlock,
} from "../../core/blockTree";
import type { BlockRegistry } from "../../core/registry";
import type { Block, Page } from "../../core/types";
import { getPreset } from "../../presets";

export type DragPayload =
  | { kind: "new"; type: string; label: string }
  | { kind: "preset"; presetId: string; label: string }
  | { kind: "move"; blockId: string; type: string };

export type HoverTarget = { containerId: string; index: number } | null;

export type UseDragAndDropOptions = {
  page: Page;
  registry: BlockRegistry;
  push: (page: Page) => void;
  onSelect?: (id: string | null) => void;
};

/**
 * CIB-style pointer DnD: palette → canvas + reorder via data-dropzone hit-testing.
 * Drop lines / ghost live in the parent editor document.
 */
export const useDragAndDrop = ({
  page,
  registry,
  push,
  onSelect,
}: UseDragAndDropOptions) => {
  const [drag, setDrag] = useState<DragPayload | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<HoverTarget>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) blockRefs.current.set(id, el);
    else blockRefs.current.delete(id);
  }, []);

  const startDragNew = useCallback(
    (type: string, e: React.PointerEvent) => {
      const def = registry.get(type);
      if (!def) return;
      e.preventDefault();
      setDrag({ kind: "new", type, label: def.label });
      setPointer({ x: e.clientX, y: e.clientY });
    },
    [registry],
  );

  const startDragPreset = useCallback(
    (presetId: string, e: React.PointerEvent) => {
      const preset = getPreset(presetId);
      if (!preset) return;
      e.preventDefault();
      setDrag({ kind: "preset", presetId, label: preset.label });
      setPointer({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const startDragMove = useCallback(
    (blockId: string, type: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDrag({ kind: "move", blockId, type });
      setPointer({ x: e.clientX, y: e.clientY });
    },
    [],
  );

  const computeHoverTarget = useCallback(
    (clientX: number, clientY: number): HoverTarget => {
      // display:contents dropzones are skipped by elementsFromPoint — walk DOM
      // with closest() from the topmost hit (and fall back to elementsFromPoint).
      const top = document.elementFromPoint(
        clientX,
        clientY,
      ) as HTMLElement | null;
      let dropEl =
        (top?.closest?.("[data-dropzone]") as HTMLElement | null) ?? null;
      if (!dropEl) {
        const els = document.elementsFromPoint(clientX, clientY);
        for (const el of els) {
          const found = (el as HTMLElement).closest?.(
            "[data-dropzone]",
          ) as HTMLElement | null;
          if (found) {
            dropEl = found;
            break;
          }
          if ((el as HTMLElement).dataset?.dropzone !== undefined) {
            dropEl = el as HTMLElement;
            break;
          }
        }
      }
      if (!dropEl) return null;
      const containerId = dropEl.dataset.dropzone!;
      const childIds = getChildrenIds(page.blocks, containerId);
      if (childIds.length === 0) return { containerId, index: 0 };

      const containerBlock =
        containerId === "root" ? null : findBlock(page.blocks, containerId);
      const isHorizontal =
        containerBlock?.type === "flex" || containerBlock?.type === "grid";

      for (let i = 0; i < childIds.length; i += 1) {
        const el = blockRefs.current.get(childIds[i]!);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (isHorizontal) {
          if (clientY < rect.top || clientY > rect.bottom) continue;
          if (clientX < rect.left + rect.width / 2) {
            return { containerId, index: i };
          }
          continue;
        }
        if (clientY < rect.top) return { containerId, index: i };
        if (clientY >= rect.top && clientY <= rect.bottom) {
          if (clientY < rect.top + rect.height / 2) {
            return { containerId, index: i };
          }
        }
      }
      return { containerId, index: childIds.length };
    },
    [page.blocks],
  );

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY });
      setHover(computeHoverTarget(e.clientX, e.clientY));
    };

    const onUp = (e: PointerEvent) => {
      const target = computeHoverTarget(e.clientX, e.clientY);
      if (target) {
        const parentId =
          target.containerId === "root" ? null : target.containerId;
        if (drag.kind === "new") {
          const def = registry.get(drag.type);
          if (def) {
            const parent = parentId ? findBlock(page.blocks, parentId) : null;
            const parentDef = parent ? registry.get(parent.type) : undefined;
            const ok =
              parentId === null ||
              (Boolean(parentDef?.isContainer) &&
                (parentDef?.canAcceptChild?.(drag.type) ?? true));
            if (ok) {
              const block = createBlockFromDefinition(def);
              try {
                const next = insertBlock(
                  page.blocks,
                  block,
                  parentId,
                  target.index,
                );
                push({ ...page, blocks: next });
                onSelect?.(block.id);
              } catch {
                // no-op
              }
            }
          }
        } else if (drag.kind === "preset") {
          const preset = getPreset(drag.presetId);
          if (preset) {
            const parent = parentId ? findBlock(page.blocks, parentId) : null;
            const parentDef = parent ? registry.get(parent.type) : undefined;
            const ok = parentId === null || Boolean(parentDef?.isContainer);
            if (ok) {
              const block = preset.create();
              try {
                const next = insertBlock(
                  page.blocks,
                  block,
                  parentId,
                  target.index,
                );
                push({ ...page, blocks: next });
                onSelect?.(block.id);
              } catch {
                // no-op
              }
            }
          }
        } else if (drag.kind === "move") {
          const intoSelf =
            target.containerId === drag.blockId ||
            isDescendant(page.blocks, drag.blockId, target.containerId);
          if (!intoSelf) {
            const moving = findBlock(page.blocks, drag.blockId);
            if (moving) {
              try {
                const { tree, removed } = removeReturning(
                  page.blocks,
                  drag.blockId,
                );
                if (removed) {
                  let idx = target.index;
                  const same = getChildrenIds(page.blocks, target.containerId);
                  const fi = same.indexOf(drag.blockId);
                  if (fi !== -1 && fi < idx) idx -= 1;
                  const next = insertBlock(tree, removed, parentId, idx);
                  push({ ...page, blocks: next });
                  onSelect?.(drag.blockId);
                }
              } catch {
                // no-op
              }
            }
          }
        }
      }
      setDrag(null);
      setPointer(null);
      setHover(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [computeHoverTarget, drag, onSelect, page, push, registry]);

  const isDraggingOverRoot = Boolean(drag && hover?.containerId === "root");

  return {
    drag,
    pointer,
    hover,
    canvasRef,
    registerRef,
    startDragNew,
    startDragPreset,
    startDragMove,
    isDraggingOverRoot,
  };
};

const removeReturning = (
  blocks: Block[],
  id: string,
): { tree: Block[]; removed: Block | null } => {
  const removed = findBlock(blocks, id) ?? null;
  if (!removed) return { tree: blocks, removed: null };
  return { tree: removeBlock(blocks, id), removed };
};
