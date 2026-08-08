import { useState, useRef, useCallback, useEffect } from 'react';
import type { Block } from '../types';
import type { DragPayload, HoverTarget } from '../components/BlockNode';
import { COMPONENT_LIBRARY } from '../constants';
import {
  createBlock,
  findBlock,
  removeBlockFromTree,
  insertBlockInTree,
  getChildrenIds,
  isDescendant,
} from '../utils';

type PanelTab = 'content' | 'style' | 'advanced';

export function useDragAndDrop(
  blocks: Block[],
  setBlocksWithHistory: (action: Block[] | ((b: Block[]) => Block[])) => void,
  currentLang: string,
  setSelectedId: (id: string | null) => void,
  setPanelTab: (tab: PanelTab) => void,
) {
  const [drag, setDrag] = useState<DragPayload | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState<HoverTarget>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [pendingDrop, setPendingDrop] = useState<{
    target: NonNullable<HoverTarget>;
    def: (typeof COMPONENT_LIBRARY)[number];
  } | null>(null);

  const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) blockRefs.current.set(id, el);
    else blockRefs.current.delete(id);
  }, []);

  const startDragNew = (def: (typeof COMPONENT_LIBRARY)[number], e: React.PointerEvent) => {
    e.preventDefault();
    setDrag({ kind: 'new', def, type: def.type });
    setPointer({ x: e.clientX, y: e.clientY });
  };

  const startDragMove = (blockId: string, label: string, e: React.PointerEvent) => {
    e.preventDefault();
    setDrag({ kind: 'move', blockId, type: label as Block['type'] });
    setPointer({ x: e.clientX, y: e.clientY });
  };

  const computeHoverTarget = useCallback(
    (clientX: number, clientY: number): HoverTarget => {
      const els = document.elementsFromPoint(clientX, clientY);
      const dropEl = els.find((el) => (el as HTMLElement).dataset?.dropzone !== undefined) as
        | HTMLElement
        | undefined;
      if (!dropEl) return null;
      const containerId = dropEl.dataset.dropzone!;
      const childIds = getChildrenIds(blocks, containerId);
      if (childIds.length === 0) return { containerId, index: 0 };

      const containerBlock = findBlock(blocks, containerId);
      const isHorizontal = containerBlock?.type === 'flex' || containerBlock?.type === 'grid';

      for (let i = 0; i < childIds.length; i++) {
        const el = blockRefs.current.get(childIds[i]);
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        if (clientY < rect.top) return { containerId, index: i };

        if (clientY >= rect.top && clientY <= rect.bottom) {
          if (isHorizontal) {
            if (clientX < rect.left + rect.width / 2) return { containerId, index: i };
          } else {
            if (clientY < rect.top + rect.height / 2) return { containerId, index: i };
          }
        }
      }
      return { containerId, index: childIds.length };
    },
    [blocks],
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
        if (drag.kind === 'new' && 'def' in drag) {
          if (drag.def.type === 'grid') {
            setPendingDrop({ target, def: drag.def });
          } else {
            const nb = createBlock(drag.def, currentLang);
            setBlocksWithHistory((p) => insertBlockInTree(p, target.containerId, target.index, nb));
            setSelectedId(nb.id);
            setPanelTab('content');
          }
        } else if (drag.kind === 'move') {
          const into =
            target.containerId === drag.blockId ||
            isDescendant(blocks, drag.blockId!, target.containerId);
          if (!into) {
            setBlocksWithHistory((p) => {
              const { tree, removed } = removeBlockFromTree(p, drag.blockId!);
              if (!removed) return p;
              let idx = target.index;
              const same = getChildrenIds(p, target.containerId);
              const fi = same.indexOf(drag.blockId!);
              if (fi !== -1 && fi < idx) idx -= 1;
              return insertBlockInTree(tree, target.containerId, idx, removed);
            });
          }
        }
      }
      setDrag(null);
      setPointer(null);
      setHover(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [
    drag,
    blocks,
    computeHoverTarget,
    currentLang,
    setBlocksWithHistory,
    setSelectedId,
    setPanelTab,
  ]);

  const isDraggingOverRoot = Boolean(drag && hover?.containerId === 'root');

  return {
    drag,
    pointer,
    hover,
    canvasRef,
    registerRef,
    pendingDrop,
    setPendingDrop,
    startDragNew,
    startDragMove,
    isDraggingOverRoot,
  };
}
