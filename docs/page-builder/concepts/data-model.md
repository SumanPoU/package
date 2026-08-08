# Data model

Canonical persisted document is **`Page` JSON** (ADR-14). Full HTML is an optional derived export, never the source of truth for re-edit.

## Concepts

| Concept | Meaning |
| --- | --- |
| **BlockDefinition** | Registered type (behavior) — never embeds page content |
| **Block** | Placed instance — never embeds render functions |
| **Page** | `blocks[]` + `meta` + optional `globalCss` / `globalJs` + `schemaVersion` + optional `revision` |
| **Preset** | Recipe that inserts a nested Block tree (Phase 12+) |
| **DataSource** / **Repeater** | Host-fed loops (Phase 15+) |

## Block shape

```ts
{
  id: string;          // stable uuid, never reused
  type: string;        // registry key (live refine, not a frozen enum)
  props: object;       // shared across locales
  i18nProps?: {        // canonical nested locale map
    [locale: string]: { [logicalKey: string]: unknown }
  };
  customCss?: string;
  customJs?: CustomScript;
  children?: Block[];
  // Forward-compatible (resolve logic in later phases):
  visibility?: …;
  visibleWhen?: …;
  dataBinding?: …;
}
```

## Page shape

```ts
{
  id: string;
  blocks: Block[];
  meta: Record<string, unknown>;
  globalCss?: string;
  globalJs?: CustomScript | CustomScript[];
  schemaVersion: number;  // currently 1 (`PAGE_SCHEMA_VERSION`)
  revision?: string;      // opaque host concurrency token (ADR-16)
}
```

## Invariants

- Load → migrate by `schemaVersion` → parse. Failures are loud.
- Engine never imports host `services/` / `store/` / `routes/`.
- Same React `render` will power canvas, Preview, and Open Page (Phase 3+).

## Limits

- Deep trees are fine; prefer primitives over mega-widgets.
- Unknown `type` at parse time: use `allowUnknownTypes` or register first; render fallback lands in Phase 14.
