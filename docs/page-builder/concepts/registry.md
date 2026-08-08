# Registry

The registry is the **only** source of block behavior. Canvas, DnD, and inspector are dispatcher-only — never `switch (block.type)` outside registry lookup.

## API

```ts
import { createRegistry, registerBlock } from "@itzsa/page-builder";

const registry = createRegistry();
registerBlock(registry, definition);
registry.get("heading");
registry.has("heading");
registry.list();
registry.types();
```

## BlockDefinition (Phase 1 fields)

| Field | Role |
| --- | --- |
| `type` | Unique key |
| `label` / `icon` / `category` | Palette / outline |
| `isContainer` / `canAcceptChild` | Nesting rules |
| `defaultProps` / `defaultI18nProps` | Insert defaults |
| `translatableProps` / `sharedProps` | Locale field split |
| `propsSchema` | Zod shape |
| `render` | Single React component for canvas + Preview + Open Page |
| `ContentFields` | Inspector Content tab (Phase 4 UI) |
| `source` | `'core' \| 'tenant' \| 'plugin'` |

## Live type refine

`createBlockSchema({ registry })` / `createPageSchema({ registry })` validate `Block.type` against the **current** registry map. New types do not require editing a frozen enum.

## Failure modes

| Case | Behavior |
| --- | --- |
| Duplicate `registerBlock` | **Throws** — no silent override |
| Empty `type` | Throws |
| Unknown type at parse (registry mode) | Zod error |
| Unknown type at render | Fallback UI (Phase 14) |

## Extension

Hosts register bundled definitions before mounting the editor (**Model A** — see [register-custom-block](../guides/register-custom-block.md)):

- Non-core types must be namespaced (`tenant:…` / `plugin:…`)
- `registerBlock` runs namespace + collision + optional capability checks
- Unknown types at render use `FallbackBlock` (tree-preserving)

Model B data-driven specs are Phase 16. Remote `eval` / `new Function` of render code is forbidden forever (ADR-12).

Repeaters / CMS loops: [data-binding](./data-binding.md).
