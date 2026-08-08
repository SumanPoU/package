import { useRef, useCallback } from 'react';
import type { Block } from '../types';
import { cloneBlock } from '../blockTreeHelpers';

export function useClipboard(
  selectedId: string | null,
  setBlocksWithHistory: (action: Block[] | ((b: Block[]) => Block[])) => void,
  setSelectedId: (id: string | null) => void,
) {
  const clipboardRef = useRef<Block | null>(null);

  const handlePaste = useCallback(
    (sourceBlock: Block) => {
      const newBlock = cloneBlock(sourceBlock);
      setBlocksWithHistory((prev) => {
        if (!selectedId) {
          return [...prev, newBlock];
        }
        const insertAfter = (list: Block[]): Block[] => {
          const idx = list.findIndex((b) => b.id === selectedId);
          if (idx !== -1) {
            const next = [...list];
            next.splice(idx + 1, 0, newBlock);
            return next;
          }
          return list.map((b) => ({
            ...b,
            children: b.children ? insertAfter(b.children) : b.children,
          }));
        };
        return insertAfter(prev);
      });
      setSelectedId(newBlock.id);
    },
    [selectedId, setBlocksWithHistory, setSelectedId],
  );

  return { clipboardRef, handlePaste };
}
