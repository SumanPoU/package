import { useEffect, type RefObject } from 'react';
import type { Block } from '../types';

export function useKeyboardShortcuts(
  selectedBlock: Block | null,
  clipboardRef: RefObject<Block | null>,
  handlePaste: (block: Block) => void,
  undo: () => void,
  redo: () => void,
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      )
        return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key === 'c') {
        if (selectedBlock) {
          e.preventDefault();
          clipboardRef.current = selectedBlock;
        }
      } else if (mod && e.key === 'v') {
        if (clipboardRef.current) {
          e.preventDefault();
          handlePaste(clipboardRef.current);
        }
      } else if (mod && e.key === 'd') {
        if (selectedBlock) {
          e.preventDefault();
          handlePaste(selectedBlock);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlock, undo, redo, handlePaste, clipboardRef]);
}
