import * as React from "react";
import type { NepaliInputMode } from "./mappings";
import { mapCaretIndex, toNepali } from "./to-nepali";

type TextLike = HTMLInputElement | HTMLTextAreaElement;

export type CaretPos = { start: number; end: number };

export type NepaliFieldOptions = {
  mode: NepaliInputMode;
  /** When false, behaves like a normal input (no transliteration). Default true. */
  enabled?: boolean;
  /** Updated whenever we remap so controlled re-renders can restore the caret. */
  caretRef?: React.MutableRefObject<CaretPos | null>;
};

/**
 * Build a change handler that transliterates Latin keystrokes to Nepali,
 * restores the caret, and notifies `onChange` with the mapped value.
 */
export function createNepaliChangeHandler<T extends TextLike>(
  options: NepaliFieldOptions,
  onChange?: React.ChangeEventHandler<T>,
): React.ChangeEventHandler<T> {
  const { mode, enabled = true, caretRef } = options;

  return (event) => {
    if (!enabled) {
      onChange?.(event);
      return;
    }

    const el = event.currentTarget;
    const raw = el.value;
    const selectionStart = el.selectionStart ?? raw.length;
    const selectionEnd = el.selectionEnd ?? selectionStart;
    const mapped = toNepali(raw, mode);

    if (mapped === raw) {
      if (caretRef) {
        caretRef.current = { start: selectionStart, end: selectionEnd };
      }
      onChange?.(event);
      return;
    }

    const nextStart = mapCaretIndex(raw, selectionStart, mode);
    const nextEnd =
      selectionStart === selectionEnd
        ? nextStart
        : mapCaretIndex(raw, selectionEnd, mode);

    el.value = mapped;
    try {
      el.setSelectionRange(nextStart, nextEnd);
    } catch {
      /* some input types disallow selection APIs */
    }

    if (caretRef) {
      caretRef.current = { start: nextStart, end: nextEnd };
    }

    onChange?.(event);
  };
}

/**
 * After a controlled re-render, restore caret if React reset it.
 */
export function useNepaliCaretRestore<T extends TextLike>(
  ref: React.RefObject<T | null>,
  _value: string | number | readonly string[] | undefined,
  _mode: NepaliInputMode,
  enabled: boolean,
) {
  const caretRef = React.useRef<CaretPos | null>(null);

  const captureCaret = React.useCallback(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    caretRef.current = {
      start: el.selectionStart ?? 0,
      end: el.selectionEnd ?? 0,
    };
  }, [enabled, ref]);

  React.useLayoutEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    const caret = caretRef.current;
    if (!el || !caret) return;
    try {
      if (el.selectionStart !== caret.start || el.selectionEnd !== caret.end) {
        el.setSelectionRange(caret.start, caret.end);
      }
    } catch {
      /* ignore */
    }
  }, [enabled, ref]);

  return { caretRef, captureCaret };
}
