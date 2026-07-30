/**
 * Scalable keyboard shortcut registry for the accessibility toolbar.
 * Add a row here to ship a new binding — the toolbar maps actions generically.
 */

import type { A11yHotkey, FeatureId } from "./types";
import { DEFAULT_HOTKEY } from "./types";

export type A11yKeyCombo = Exclude<A11yHotkey, null>;

export type A11yShortcutAction =
  | { type: "togglePanel" }
  | { type: "reset" }
  | {
      type: "feature";
      feature: FeatureId;
      /** cycle = next level / toggle; inc|dec = stepped only */
      mode: "cycle" | "toggle" | "inc" | "dec";
    };

export type A11yShortcutDef = {
  /** Stable id for overrides / docs. */
  id: string;
  keys: A11yKeyCombo;
  action: A11yShortcutAction;
  /** Human label for docs / help UIs. */
  label: string;
};

function combo(partial: Partial<A11yKeyCombo> & { key: string }): A11yKeyCombo {
  return {
    altKey: partial.altKey ?? false,
    ctrlKey: partial.ctrlKey ?? false,
    metaKey: partial.metaKey ?? false,
    shiftKey: partial.shiftKey ?? false,
    key: partial.key,
  };
}

/**
 * Default bindings (Alt+Shift+… for features so Alt+A stays free for the panel).
 * Hosts can replace via `shortcuts={[...]}` or disable with `shortcuts={false}`.
 */
export const DEFAULT_A11Y_SHORTCUTS: readonly A11yShortcutDef[] = [
  {
    id: "togglePanel",
    keys: DEFAULT_HOTKEY,
    action: { type: "togglePanel" },
    label: "Toggle accessibility panel",
  },
  {
    id: "reset",
    keys: combo({ altKey: true, shiftKey: true, key: "r" }),
    action: { type: "reset" },
    label: "Reset all preferences",
  },
  {
    id: "textSizeInc",
    keys: combo({ altKey: true, shiftKey: true, key: "=" }),
    action: { type: "feature", feature: "textSize", mode: "inc" },
    label: "Increase text size",
  },
  {
    id: "textSizeDec",
    keys: combo({ altKey: true, shiftKey: true, key: "-" }),
    action: { type: "feature", feature: "textSize", mode: "dec" },
    label: "Decrease text size",
  },
  {
    id: "highContrast",
    keys: combo({ altKey: true, shiftKey: true, key: "c" }),
    action: { type: "feature", feature: "highContrast", mode: "cycle" },
    label: "Cycle contrast",
  },
  {
    id: "pauseAnimations",
    keys: combo({ altKey: true, shiftKey: true, key: "m" }),
    action: { type: "feature", feature: "pauseAnimations", mode: "toggle" },
    label: "Toggle pause animations",
  },
  {
    id: "readingGuide",
    keys: combo({ altKey: true, shiftKey: true, key: "g" }),
    action: { type: "feature", feature: "readingGuide", mode: "toggle" },
    label: "Toggle reading guide",
  },
  {
    id: "highlightLinks",
    keys: combo({ altKey: true, shiftKey: true, key: "l" }),
    action: { type: "feature", feature: "highlightLinks", mode: "toggle" },
    label: "Toggle highlight links",
  },
  {
    id: "dyslexiaFriendly",
    keys: combo({ altKey: true, shiftKey: true, key: "d" }),
    action: { type: "feature", feature: "dyslexiaFriendly", mode: "toggle" },
    label: "Toggle reading spacing aid",
  },
];

/** Format a combo for docs (e.g. `Alt+Shift+R`). */
export function formatShortcutLabel(keys: A11yKeyCombo): string {
  const parts: string[] = [];
  if (keys.ctrlKey) parts.push("Ctrl");
  if (keys.metaKey) parts.push("Meta");
  if (keys.altKey) parts.push("Alt");
  if (keys.shiftKey) parts.push("Shift");
  const key =
    keys.key === "="
      ? "+"
      : keys.key.length === 1
        ? keys.key.toUpperCase()
        : keys.key;
  parts.push(key);
  return parts.join("+");
}

/**
 * Merge host overrides by `id`. Pass `null` for an id to remove a default.
 * Unknown ids are appended (scalable for custom host actions later).
 */
export function mergeA11yShortcuts(
  base: readonly A11yShortcutDef[] = DEFAULT_A11Y_SHORTCUTS,
  overrides?: readonly (A11yShortcutDef | { id: string; keys: null })[],
): A11yShortcutDef[] {
  if (!overrides?.length) return [...base];
  const map = new Map(base.map((s) => [s.id, s]));
  for (const item of overrides) {
    if ("keys" in item && item.keys === null) {
      map.delete(item.id);
      continue;
    }
    const full = item as A11yShortcutDef;
    map.set(full.id, full);
  }
  return [...map.values()];
}

/**
 * Resolve the active shortcut list from props.
 * - `undefined` → defaults (panel toggle still respects legacy `hotkey`)
 * - `false` → no feature shortcuts; panel still uses `hotkey` if set
 * - array → full list (caller should include panel if desired)
 */
export function resolveA11yShortcuts(input: {
  shortcuts?: readonly A11yShortcutDef[] | false;
  hotkey?: A11yHotkey;
}): A11yShortcutDef[] {
  const { shortcuts, hotkey } = input;

  if (shortcuts === false) {
    return hotkey
      ? [
          {
            id: "togglePanel",
            keys: hotkey,
            action: { type: "togglePanel" },
            label: "Toggle accessibility panel",
          },
        ]
      : [];
  }

  if (Array.isArray(shortcuts)) {
    return [...shortcuts];
  }

  // Defaults — sync legacy `hotkey` into togglePanel binding.
  if (hotkey === null) {
    return mergeA11yShortcuts(DEFAULT_A11Y_SHORTCUTS, [
      { id: "togglePanel", keys: null },
    ]);
  }
  return mergeA11yShortcuts(DEFAULT_A11Y_SHORTCUTS, [
    {
      id: "togglePanel",
      keys: hotkey ?? DEFAULT_HOTKEY,
      action: { type: "togglePanel" },
      label: "Toggle accessibility panel",
    },
  ]);
}

export function matchesShortcut(
  event: KeyboardEvent,
  keys: A11yKeyCombo,
): boolean {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const want = keys.key.length === 1 ? keys.key.toLowerCase() : keys.key;
  // Treat NumpadAdd / Equal as "+"/"=" for text-size-up.
  const keyNorm =
    key === "+" || event.code === "Equal" || event.code === "NumpadAdd"
      ? "="
      : key === "_"
        ? "-"
        : key;
  const wantNorm = want === "+" ? "=" : want;
  if (keyNorm !== wantNorm && key !== want) return false;
  if (Boolean(keys.altKey) !== event.altKey) return false;
  if (Boolean(keys.ctrlKey) !== event.ctrlKey) return false;
  if (Boolean(keys.metaKey) !== event.metaKey) return false;
  if (Boolean(keys.shiftKey) !== event.shiftKey) return false;
  return true;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}
