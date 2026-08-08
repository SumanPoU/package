# Page Builder — Architecture Standard (Agent Instructions)

> **Read this fully before writing or editing any code in `src/components/page-builder/`.**
> This document is the source of truth for how the page builder must be structured. It exists
> to keep the codebase scalable and to keep it on a path toward becoming a standalone,
> publishable package (like Puck, Craft.js, GrapesJS) rather than app-coupled spaghetti.
>
> If a change you're about to make conflicts with this document, STOP and flag it instead of
> silently deviating.

---

## 0. Prime Directive

**Every block is self-contained.** Adding, editing, or removing a block type must never require
touching a shared "god file" (a giant `switch` statement, a shared constants array with 40
entries, etc.). If you find yourself adding a `case` to `AdvancedStylePanel.tsx` or growing
`renderBlock.ts` beyond registry dispatch — **stop**. That pattern is deprecated. Use the Block
Registry instead (Section 2).

---

## 1. Target Folder Structure

```
src/components/page-builder/
├── core/                          # Framework-agnostic engine (candidate for future @org/page-builder-core package)
│   ├── types.ts                   # Block, AdvancedStyle, ComponentType, BlockDefinition
│   ├── registry.ts                # registerBlock(), getBlockDefinition(), listBlocks()
│   ├── blockTree.ts               # pure tree ops: insert/remove/clone/find
│   ├── i18nResolve.ts             # resolveProps(block, lang)
│   ├── styleBuilder.ts            # AdvancedStyle -> CSS
│   ├── blockCss.ts                # CSS collection for canvas + export
│   └── schema/
│       ├── block.schema.ts        # zod schema, validated on load + publish
│       └── style.schema.ts
│
├── blocks/                        # ONE FOLDER PER BLOCK TYPE. This is where 90% of work happens.
│   ├── heading/
│   │   ├── index.ts                # registerBlock({...}) — the ONLY required export
│   │   ├── heading.types.ts        # HeadingProps
│   │   ├── HeadingElement.tsx      # canvas render
│   │   ├── HeadingContentFields.tsx
│   │   ├── HeadingStyleFields.tsx  # optional — omit if block only uses shared style panel
│   │   ├── heading.render.ts       # renderToHtml(block, ctx): string
│   │   └── heading.test.ts         # canvas + export parity test (see Section 6)
│   ├── text/
│   ├── image/
│   ├── button/
│   ├── grid/
│   ├── flex/
│   ├── container/
│   │   ...  (one folder per supported block type, same shape)
│   └── index.ts                    # imports every block folder to trigger registration side-effects
│
├── editor/                        # The actual app-facing editor UI (React shell)
│   ├── PageBuilder.tsx             # thin shell — wiring only, no block-specific logic
│   ├── PagePreview.tsx
│   ├── components/
│   │   ├── LeftSidebar.tsx
│   │   ├── ElementsPanel.tsx
│   │   ├── OutlineList.tsx
│   │   ├── BlockInspectorPanel.tsx # renders def.ContentFields + def.StyleFields dynamically
│   │   ├── CanvasArea.tsx
│   │   ├── BlockNode.tsx
│   │   └── DragGhost.tsx
│   └── hooks/
│       ├── useDragAndDrop.ts
│       ├── useBlockHistory.ts
│       ├── useClipboard.ts
│       ├── usePageHydration.ts
│       └── useKeyboardShortcuts.ts
│
├── html-export/
│   ├── index.ts                    # generatePreviewHTML — orchestration only
│   ├── collectCss.ts
│   └── renderBlock.ts              # registry dispatch + container layout branch
│
├── migrations/
│   └── styleMigration.ts
│
├── constants.ts                    # ONLY: DEFAULT_STYLE, non-block-specific config
└── utils.ts                        # re-export barrel, kept for backward compat only — no new logic here
```

**Rule:** if a file's line count is trending toward 300+, it is doing too many blocks' worth of
work and needs to be split along block boundaries, not left to grow.

---

## 2. The Block Registry (mandatory pattern for all block work)

### 2.1 Definition shape

```typescript
// core/types.ts
export type BlockDefinition<P = Record<string, unknown>> = {
  type: ComponentType;
  label: string;
  icon: LucideIcon;
  category: 'layout' | 'basic' | 'forms' | 'media' | 'marketing' | 'embeds' | 'interactive';
  isContainer?: boolean;

  defaultProps: P;
  defaultStyle?: Partial<AdvancedStyle>;
  translatableProps: (keyof P)[];
  sharedProps: (keyof P)[];

  CanvasComponent: React.FC<{ block: Block; lang: string }>;
  ContentFields: React.FC<{
    block: Block;
    onChangeShared: OnChangeShared;
    onChangeI18n: OnChangeI18n;
  }>;
  StyleFields?: React.FC<{ block: Block; device: Device }>; // omit -> falls back to shared AdvancedStylePanel sections only
  renderToHtml: (block: Block, ctx: ExportContext) => string;

  // Required in practice (enforced by registry.drift.test.ts). Typed optional only so
  // BlockSchema can still fall back to z.record(z.string()) for incomplete definitions.
  propsSchema?: z.ZodType<P>;
};
```

### 2.2 Registering a block

```typescript
// blocks/heading/index.ts
import { registerBlock } from '@/components/page-builder/core/registry';
import { HeadingElement } from './HeadingElement';
import { HeadingContentFields } from './HeadingContentFields';
import { renderHeadingToHtml } from './heading.render';

registerBlock({
  type: 'heading',
  label: 'Heading',
  icon: Heading1Icon,
  category: 'basic',
  defaultProps: { text: 'Heading', level: '2' },
  translatableProps: ['text'],
  sharedProps: ['level'],
  CanvasComponent: HeadingElement,
  ContentFields: HeadingContentFields,
  renderToHtml: renderHeadingToHtml,
});
```

### 2.3 Registration entrypoint

```typescript
// blocks/index.ts — imported ONCE at app boot (e.g. in PageBuilder.tsx or a root layout)
import './heading';
import './text';
import './image';
// ...every block folder
```

### 2.4 Every consumer becomes a dispatcher, never a switch

```typescript
// editor/components/BlockInspectorPanel.tsx
const def = getBlockDefinition(block.type);
return (
  <Tabs>
    <TabPanel label="Content"><def.ContentFields block={block} ... /></TabPanel>
    <TabPanel label="Style">
      <AdvancedStylePanelShared block={block} />
      {def.StyleFields && <def.StyleFields block={block} device={device} />}
    </TabPanel>
  </Tabs>
);
```

```typescript
// core/renderBlockToHtml.ts (replaces lib/html-export/renderBlock.ts giant switch)
export function renderBlockToHtml(block: Block, ctx: ExportContext): string {
  const def = getBlockDefinition(block.type);
  if (!def) throw new Error(`Unregistered block type: ${block.type}`);
  return def.renderToHtml(block, ctx);
}
```

**If you are editing an existing block and see a `case` for it in a shared file, migrate that
block to the registry pattern as part of your change instead of adding to the switch.**

---

## 3. Locale Handling (fixes the `eng`/`en` bug — non-negotiable)

- ONE canonical source: `config/languages.ts` exports `LOCALES = { EN: 'eng', NP: 'np' } as const`
  (aligned with `SUPPORTED_LANGUAGES[].code`).
- **Never** write the string literals `'en'`, `'eng'`, `'np'`, or `'nep'` (or bare object keys
  `en:` / `eng:` / `np:` / `nep:`) anywhere under `src/components/page-builder/`. Always import
  `LOCALES` from `@/config/languages`.
- `handlePublish`, `langFieldMap.ts`, `usePageMeta`, and `metaTags.ts` must reference
  `LOCALES.EN` / `LOCALES.NP` — not raw strings.
- **Enforcement:** Vitest CI check `core/localeLiterals.drift.test.ts` scans
  `src/components/page-builder/**/*.{ts,tsx}` and fails on banned literals/keys. This is **not**
  an ESLint rule today because `page-builder/**` is in ESLint `globalIgnores` — un-ignoring that
  directory is a separate initiative; if it happens, layer in the §3 `no-restricted-syntax` rule
  for defense-in-depth. Until then, the Vitest scan is the regression net.

---

## 4. State & Data Rules

- Block tree state lives ONLY in `useBlockHistory`. Never introduce a second source of truth for
  block data (no duplicating blocks into Redux, no block data in TanStack Query cache).
- Redux is for cross-cutting UI/global state only (active language). Do not put block or page
  content in Redux.
- TanStack Query is for server I/O only (`useAddPage`, `useUpdatePage`, `useShowPage`). Never call
  `fetch`/`axios` directly inside a component under `page-builder/`.
- All page persistence goes through `services/website/use-pages.ts`. No exceptions.

---

## 5. Schema Validation (mandatory boundary)

- Define `BlockSchema` (zod) in `core/schema/block.schema.ts`, built from the registry so it stays
  in sync automatically:

```typescript
export const BlockSchema: z.ZodType<Block> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(listBlocks().map((b) => b.type) as [string, ...string[]]),
    props: z.record(z.string()),
    i18nProps: z.record(z.record(z.string())),
    style: AdvancedStyleSchema,
    visibility: DeviceVisibilitySchema,
    responsiveStyle: ResponsiveOverridesSchema,
    children: z.array(BlockSchema).optional(),
  }),
);
```

- Validate:
  - On load: `usePageHydration` → parse JSON → `migrateBlockStyle` → `BlockSchema.array().parse(...)`
  - On publish: before calling `useAddPage`/`useUpdatePage`
- On validation failure: surface a clear error to the user, never silently drop/mutate content.

---

## 6. Testing Requirement (prevents canvas/export drift)

Every block folder must include a test asserting both render paths exist and don't throw on
default props:

```typescript
// blocks/heading/heading.test.ts
import { getBlockDefinition } from '@/components/page-builder/core/registry';

test('heading block is fully registered', () => {
  const def = getBlockDefinition('heading');
  expect(def.CanvasComponent).toBeDefined();
  expect(def.ContentFields).toBeDefined();
  expect(def.renderToHtml).toBeDefined();
  expect(() => def.renderToHtml(mockBlock('heading', def.defaultProps), mockCtx())).not.toThrow();
});
```

A repo-level test (`core/registry.drift.test.ts`) iterates `listBlocks()` and fails CI if any
registered block is missing a required field — including **`propsSchema`**, which is mandatory for
every new block even though `BlockDefinition.propsSchema` remains typed optional (the
`?? z.record(z.string())` fallback in `BlockSchema` is legacy-only; do not ship a block without a
real schema). This is the automated guard against the "dual render path drift" problem.

---

## 7. Package-Readiness Rules (so this can eventually ship as `@yourorg/page-builder`)

Even while it lives inside the app, code under `core/` and `blocks/` must follow these constraints
so extraction later is a lift-and-shift, not a rewrite:

1. **No imports from app-level `src/services/`, `src/store/`, or `src/routes/` inside `core/` or
   `blocks/`.** Those layers only get consumed inside `editor/`. If a block needs data (e.g. a
   media picker needs an upload endpoint), it must receive it via props/context injected from
   `editor/`, never import it directly.
2. **No Redux inside `core/` or `blocks/`.** Language/device context is passed as explicit props
   or via a local `PageBuilderContext`, not the app's global store.
3. **Styling stays Tailwind utility classes + inline styles only** — no dependency on app-specific
   design tokens that wouldn't exist in a consumer's project.
4. **Every block folder is import-isolated** — a block must not import another block's internals.
   Shared behavior goes in `core/`.
5. Longer-term target public API shape (do not build this yet, just don't architect against it):

```typescript
import { PageBuilder, registerBlock, type BlockDefinition } from '@yourorg/page-builder';
```

---

## 8. Migration Plan

| Phase | Status   | Task                                                                                                                                      |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | **Done** | `PageBuilder - Copy.tsx` already gone; removed unused `react-quill`; kept `@dnd-kit/*` (used by FAQs/menu sortable UIs, not page-builder) |
| 1     | Done     | Introduce `core/registry.ts` + `BlockDefinition` type                                                                                     |
| 2     | Done     | Migrate simple blocks into `blocks/` folders as proof of pattern                                                                          |
| 3     | Done     | Migrate all retained block types into `blocks/`                                                                                           |
| 4     | **Done** | Delete god-file switches; registry-only dispatch in `ElementRenderer.tsx` and `renderBlock.ts`; remove `ContentFields.tsx`                |
| 5     | **Done** | Add `BlockSchema` zod validation at load/publish boundaries (loose `props`; per-block `propsSchema` deferred to Phase 5b)                 |
| 5b    | **Done** | Per-block `propsSchema` for all 23 registered blocks (shape validation; numeric range/coercion deferred)                                  |
| 6     | **Done** | Fix `eng`/`en` locale literals via `LOCALES`; Vitest literal-scan (ESLint deferred while page-builder is globalIgnored)                   |
| 7     | **Done** | CI drift-detection test: `core/registry.drift.test.ts` iterates `listBlocks()` + syncs with `COMPONENT_LIBRARY`                           |
| 8     | Done     | `ElementsPanel.tsx` shows `layout`, `basic`, `marketing`, `embeds` categories                                                             |

### Changelog — removed block types (pre-production, not migrated)

The following **14** `ComponentType` values were **removed from the product** (July 2026) rather
than migrated to the registry. They are no longer in `COMPONENT_LIBRARY`, the panel, or export.
Legacy JSON containing these types is skipped silently at canvas/export (dev-only `console.warn`).

`form_block`, `form_input`, `form_textarea`, `form_checkbox`, `form_select`, `form_submit`,
`gallery`, `image_carousel`, `before_after`, `logo_strip`, `pricing`, `cta`, `countdown`, `modal`

### Remaining intentional per-type specialization

| Location                                               | Notes                                                                                                                                                                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/blockCss.ts` → `defaultTextColor`                 | `heading`, `text`, `list`, `button` — shared CSS infra; candidate for registry metadata later                                                                                                                                                   |
| `lib/html-export/renderBlock.ts` → `isContainerType()` | **Intentional exception:** `container` / `flex` / `grid` HTML export stays in this shared early branch (avoids circular import until `ExportContext`/`renderChild` exists). Registry layout stubs return `''` and are not the live export path. |
| `blocks/html` export                                   | Sanitized via `lib/sanitizeHtml.ts` (DOMPurify / isomorphic-dompurify). Canvas still shows source preview only (not executed).                                                                                                                  |
| `blocks/text` canvas + export                          | Sanitized via `lib/sanitizeHtml.ts` (same allowlist as `blocks/html`) on both canvas `dangerouslySetInnerHTML` and export                                                                                                                       |
| `components/AdvancedStylePanel.tsx`                    | Layout/image style branches by `block.type` — acceptable shared style infra                                                                                                                                                                     |

**Never add a block by editing a god-file switch.** Register via `blocks/<type>/index.ts`.

---

## 9. Hard Rules Summary (checklist before any PR)

- [ ] Did not add a `case` to `AdvancedStylePanel.tsx` or expand `renderBlock.ts` beyond registry dispatch + the container layout branch
- [ ] New/changed block lives entirely in its own `blocks/<type>/` folder
- [ ] No raw `'en'` / `'eng'` / `'np'` / `'nep'` string literals (use `LOCALES`; enforced by `localeLiterals.drift.test.ts`)
- [ ] No block data written into Redux or TanStack Query cache
- [ ] No direct `fetch`/`axios` calls inside `page-builder/` — goes through `services/website/use-pages.ts`
- [ ] `core/` and `blocks/` do not import from `src/services/`, `src/store/`, or `src/routes/`
- [ ] Block has a test asserting registry completeness
- [ ] If schema-relevant (new prop, new style field), `BlockSchema`/`AdvancedStyleSchema` updated
- [ ] File does not exceed ~300 lines; if it does, split along block/feature boundaries
