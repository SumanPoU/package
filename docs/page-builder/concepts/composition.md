# Composition (primitives + presets)

Pages are trees of **primitive** blocks (`box`, `heading`, `text`, `image`, `button`, `flex`, `grid`, …). Composites like “card” or “hero” are not separate block types — they are **presets**: one palette action that inserts a nested primitive tree.

## Why

- Remix and restyle without forking a mega-widget
- Stored JSON stays a normal `Block[]` (editable in outline / canvas)
- Same `render` path for canvas, Preview, and Open Page (ADR-01 / ADR-07)

## Package API

```ts
import {
  listPresets,
  getPreset,
  createCardPreset,
  createHeroPreset,
} from "@itzsa/page-builder";

listPresets(); // [{ id: "card", … }, { id: "hero", … }]
const tree = getPreset("card")?.create(); // Block root + children
```

Presets live under `packages/page-builder/src/presets/`. DnD payload `kind: "preset"` expands via `create()` on drop — never stores a `type: "card"` block.

## Author CSS in presets

Preset factories may set starter `customCss` on inserted nodes. That is **author CSS on the page JSON**, not engine decorative skins (ADR-03).
