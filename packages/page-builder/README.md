# @itzsa/page-builder

Drag-and-drop visual page builder for React (Elementor / Webflow / Puck class).

**Phase 1 (this release):** core data model, live block registry, immutable tree
ops, Zod schemas, and first-class content locales (`i18nResolve`).

Architecture: see repo root `ARCHITECTURE-PAGE-BUILDER.md`. Topic docs:
`docs/page-builder/`.

## Install

```bash
pnpm add @itzsa/page-builder zod
```

Peer: `react`, `react-dom` (^18 || ^19).

## Quick start

```ts
import {
  createRegistry,
  createDefaultLocaleConfig,
  normalizeI18n,
  resolveProps,
  insertBlock,
  createPageSchema,
  PAGE_SCHEMA_VERSION,
  type Block,
  type BlockDefinition,
} from "@itzsa/page-builder";
import { z } from "zod";

const registry = createRegistry();
const locales = createDefaultLocaleConfig();

// registerBlock(registry, headingDefinition) — Phase 2 primitives

const pageSchema = createPageSchema({
  registry,
  allowUnknownTypes: true, // until primitives are registered
});

const raw = normalizeI18n(
  { props: { desc_en: "Hello", desc_ne: "नमस्ते" } },
  locales,
);
// → i18nProps: { en: { desc: "Hello" }, ne: { desc: "नमस्ते" } }

const block: Block = {
  id: "b1",
  type: "heading",
  props: {},
  i18nProps: raw.i18nProps,
};

resolveProps(block, "ne", locales); // { desc: "नमस्ते" }
```

## Public API (Phase 1)

| Export | Role |
| --- | --- |
| `createRegistry` / `registerBlock` | Live block definition map |
| `insertBlock` / `removeBlock` / `moveBlock` / `updateBlock` / `cloneBlock` / `findBlock` | Immutable tree ops |
| `createDefaultLocaleConfig` / `normalizeI18n` / `resolveProps` / `serializeI18n` | ADR-10 locale pipeline |
| `createBlockSchema` / `createPageSchema` | Zod parse; `type` refined against registry |
| `PAGE_SCHEMA_VERSION` | Current document schema version |

## License

MIT
