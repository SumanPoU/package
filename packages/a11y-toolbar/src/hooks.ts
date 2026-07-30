"use client";

import { type RefObject, useCallback, useEffect, useId, useRef } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  onEscape?: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const node = containerRef.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );

    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [active, containerRef, onEscape]);
}

export function useHotkey(
  hotkey: {
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    key: string;
  } | null,
  handler: () => void,
  enabled: boolean,
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled || !hotkey) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const want =
        hotkey.key.length === 1 ? hotkey.key.toLowerCase() : hotkey.key;
      if (key !== want) return;
      if (Boolean(hotkey.altKey) !== event.altKey) return;
      if (Boolean(hotkey.ctrlKey) !== event.ctrlKey) return;
      if (Boolean(hotkey.metaKey) !== event.metaKey) return;
      if (Boolean(hotkey.shiftKey) !== event.shiftKey) return;

      event.preventDefault();
      handlerRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hotkey, enabled]);
}

/**
 * Multi-binding shortcut bus — used by the toolbar for panel + feature keys.
 * First matching binding wins (registry order).
 */
export function useA11yShortcuts(
  bindings: readonly {
    keys: {
      altKey?: boolean;
      ctrlKey?: boolean;
      metaKey?: boolean;
      shiftKey?: boolean;
      key: string;
    };
  }[],
  onMatch: (index: number) => void,
  enabled: boolean,
) {
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    if (!enabled || bindings.length === 0) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      const list = bindingsRef.current;
      for (let i = 0; i < list.length; i++) {
        const keys = list[i]!.keys;
        const key =
          event.key.length === 1 ? event.key.toLowerCase() : event.key;
        const want = keys.key.length === 1 ? keys.key.toLowerCase() : keys.key;
        const keyNorm =
          key === "+" || event.code === "Equal" || event.code === "NumpadAdd"
            ? "="
            : key === "_"
              ? "-"
              : key;
        const wantNorm = want === "+" ? "=" : want;
        if (keyNorm !== wantNorm && key !== want) continue;
        if (Boolean(keys.altKey) !== event.altKey) continue;
        if (Boolean(keys.ctrlKey) !== event.ctrlKey) continue;
        if (Boolean(keys.metaKey) !== event.metaKey) continue;
        if (Boolean(keys.shiftKey) !== event.shiftKey) continue;
        event.preventDefault();
        onMatchRef.current(i);
        return;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [bindings, enabled]);
}

export function useIdSafe(prefix: string): string {
  const id = useId();
  return `${prefix}-${id.replace(/:/g, "")}`;
}

export function useStableCallback<T extends (...args: never[]) => unknown>(
  fn: T,
): T {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args: never[]) => ref.current(...args), []) as T;
}
