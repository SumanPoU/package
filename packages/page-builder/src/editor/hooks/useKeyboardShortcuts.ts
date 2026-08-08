import { useEffect } from "react";

export type KeyboardShortcutHandlers = {
  onDelete?: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
};

export const useKeyboardShortcuts = (
  handlers: KeyboardShortcutHandlers,
  enabled = true,
): void => {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        // Allow Ctrl shortcuts even in fields for undo; skip delete/copy of blocks
        if (!event.ctrlKey && !event.metaKey) return;
      }

      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if ((event.key === "Delete" || event.key === "Backspace") && !mod) {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        handlers.onDelete?.();
        return;
      }

      if (!mod) return;

      if (key === "c") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        handlers.onCopy?.();
      } else if (key === "x") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        handlers.onCut?.();
      } else if (key === "v") {
        if (isEditableTarget(event.target)) return;
        event.preventDefault();
        handlers.onPaste?.();
      } else if (key === "d") {
        event.preventDefault();
        handlers.onDuplicate?.();
      } else if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        handlers.onUndo?.();
      } else if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        handlers.onRedo?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, handlers]);
};
