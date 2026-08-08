# Clipboard

Copy / cut / paste / duplicate are first-class editor ops (§10.3). Clipboard holds serialized `Block` JSON in session memory (not persisted unless the host asks).

## Actions

| Action | Behavior |
| --- | --- |
| Copy | Deep-clone selected subtree into clipboard |
| Cut | Copy + remove (history) |
| Paste | Insert under selection’s parent (or into selected container) with **new ids** for every node |
| Duplicate | Copy + paste in place (sibling after) |

## Preserved on clone

`customCss` / `customJs` / props / `i18nProps` / children / `visibility` / `visibleWhen` / `dataBinding`.

## Rules

- `core/clipboard.ts` / `useClipboard` — **regenerate all `id`s on paste** (never reuse)
- Keyboard: Ctrl/Cmd+C, X, V, D via `useKeyboardShortcuts`
- Invalid paste target → no-op or fall back to root; respect `canAcceptChild`
- All mutations history-aware

## API

```ts
import {
  copyBlockToClipboard,
  cutBlockToClipboard,
  takePasteClone,
  clearClipboard,
} from "@itzsa/page-builder";
```

## Related

[outline-tree](./outline-tree.md) · [drag-and-drop](./drag-and-drop.md)
