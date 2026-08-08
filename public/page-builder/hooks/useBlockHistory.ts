import { useState, useRef, useCallback } from 'react';
import type { Block } from '../types';

export function useBlockHistory(initialBlocks: Block[] = []) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const historyRef = useRef({ past: [] as Block[][], future: [] as Block[][] });

  const setBlocksWithHistory = useCallback((action: Block[] | ((b: Block[]) => Block[])) => {
    setBlocks((current) => {
      const next = typeof action === 'function' ? action(current) : action;
      if (next !== current) {
        historyRef.current.past.push(current);
        historyRef.current.future = [];
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setBlocks((current) => {
      const past = historyRef.current.past;
      if (past.length === 0) return current;
      const previous = past.pop()!;
      historyRef.current.future.unshift(current);
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setBlocks((current) => {
      const future = historyRef.current.future;
      if (future.length === 0) return current;
      const next = future.shift()!;
      historyRef.current.past.push(current);
      return next;
    });
  }, []);

  return { blocks, setBlocks, setBlocksWithHistory, undo, redo };
}
