# Page Builder — Architecture Standard

> **Status:** design authority for `@itzsa/page-builder` (planned extractable package).  
> **Scope:** drag-and-drop visual page builder for React (Elementor / Webflow / Puck class).  
> **Rule:** if implementation conflicts with this document, stop and flag it — do not deviate silently.  
> **This file is architecture only.** It does not ship application code.

---

## 0. Goals, Non-Goals, and Product Intent

### Goals

1. **One registry, one schema, one React render path** for every block type — static, tenant-defined, and (later) plugin blocks.
2. **True WYSIWYG** — what you see on the canvas must match the **Open Page / published** view. Same React block component; same author CSS; no engine-injected “pretty” styles that only exist in the editor.
3. **Author-owned CSS** — the engine does **not** ship decorative per-block CSS. Users place CSS themselves (per block and/or page-level). The engine only provides safe injection + scoping + isolation.
4. **Composition over mega-widgets** — complex UI (cards, heroes, feature rows) is built by nesting **primitives** (box/div, heading, paragraph, image, button, …), not by hardcoding opaque `blog-card`-style composites as the only path.
5. **Full editor operations** — select, delete, copy, paste, duplicate, undo/redo, and a visible **tree hierarchy (outline)** of the page.
6. **First-class locales** — content fields are locale-aware (English, Nepali, and any additional locales the host configures). Not a DIY afterthought (Puck barely supports content i18n natively).
7. **Large-page-safe preview** — never encode full page JSON in the URL (Puck-style / query-string payloads break on large pages). Preview uses short tokens + storage/API (see §20).
8. **Flexible, dynamic, robust by design** — every subsystem (registry, fields, DnD, CSS/JS, i18n, preview, presets, visibility, data-binding, custom registration) must be extensible without forking the engine.
9. **Docs like Puck** — each capability has its own documentation page under `docs/` (API + how-to), not a single dump README.
10. **Package-extractable engine** — host app owns auth, persistence, uploads, audit; engine owns editing + rendering.
11. **React-native DX** — works cleanly in React / Next.js; blocks are real React components.
12. **Secure by construction** — canvas sandbox, CSS/JS composers, bridge hardening, and registration guards (see §22 / §24).
13. **Conditional visibility + dynamic data loops** — without monolithic widgets (see §23 / §25).
14. **Accessible by default** — WCAG 2.2 AA / Web Interface Guidelines for every block and editor control (ADR-13).

### Design qualities (apply to every subsystem)

| Quality | Meaning |
| --- | --- |
| **Flexible** | Host can add locales, blocks, fields, presets, preview backends, data sources without editing engine internals. |
| **Dynamic** | Registry, fields, locales, visibility, and data binding resolve at runtime — not frozen compile-time enums. |
| **Robust** | Trust boundaries validated (schemas, composers, sandbox); large pages / many locales / deep trees do not break preview or save; failures are explicit. |

### Non-goals (unless a real requirement appears)

- Real-time multiplayer / OT / presence (keep the tree op-friendly for later; do not build it now).
- Full plugin marketplace (billing, review queues). Build sandbox + registration primitives first (§24).
- Hand-maintained dual HTML string templates per block as the primary publish path.
- Engine-authored “theme packs” or opinionated default looks for marketing widgets that make canvas ≠ open page.
- Treating monolithic composites (`hero`, `blog-card`) as the primary design model (CIB lesson — see §1.6 / §9 / §25).
- Putting entire page documents in URL query/hash for preview.
- Client-side `eval` / `new Function` of fetched block render code (§24).

### Product bar

| Bar | Meaning |
| --- | --- |
| Like **Puck** | Clean registry API; same React render for edit + publish; host owns data; **per-topic docs**. |
| Beyond **Puck** | First-class content i18n (en / ne / …); preview that scales past URL size limits; security model; data-bound repeaters. |
| Like **Elementor / Webflow** | Compose from primitives; Advanced Custom CSS/JS; iframe canvas; outline/layers; Posts/loop widgets via binding. |
| Like **GrapesJS** | Canvas iframe isolation; CSS as author-controlled rules, not editor decoration. |
| Unlike **Craft.js alone** | We ship editor chrome + operations + CSS/JS pipeline, not only DnD primitives. |

---

## 1. Prior Art Analysis

What we borrow, what we reject, and why.

### 1.1 Puck (`@puckeditor/core`)

| Trait | Detail |
| --- | --- |
| Model | `config.components[type] = { fields, render, defaultProps, … }` |
| Edit vs publish | Same `render` used by `<Puck>` and `<Render>` |
| Data | JSON payload; host persists it |
| Docs | Strong — each concept (Config, Data, Fields, Render, …) has its own docs page |
| Strength | Minimal, React-first, extractable, documentation culture |
| Gap — CSS/JS | Weak first-class Custom CSS/JS sandbox; canvas often same-document as chrome |
| Gap — **i18n** | Editor UI strings may get a `dictionary` prop; **content locale** (en/ne/…) is DIY via `resolveFields` / nested objects — not a first-class page-builder locale model. Hard for Nepali + English (+ more) as a product feature. |
| Gap — **preview** | Common integrations pass or imply page identity via URL path; demos/recipes and custom apps often push **data through the URL** (query/hash) or assume tiny payloads. **Browser URL length limits** (~2KB–64KB depending on browser/server) make this **unusable for large pages** (many blocks, images metadata, multi-locale props, custom CSS). |

**Borrow:** registry-as-config; **one React `render` for canvas and publish**; host-injected save/publish; **docs-per-topic** structure.

**Reject / replace:** URL-encoded full page data for preview; treating content i18n as optional DIY.

### 1.2 GrapesJS

| Trait | Detail |
| --- | --- |
| Canvas | **Iframe** — page styles stay out of editor chrome |
| Styles | CssComposer — author CSS rules, not only inline hacks |
| Scripts | Run inside canvas iframe |
| Strength | Isolation + clean HTML/CSS separation |
| Gap | Not React-component-native |

**Borrow:** iframe canvas; author CSS/JS confined to the page document; pluggable storage.

### 1.3 Craft.js

| Trait | Detail |
| --- | --- |
| Model | Nodes + resolver (`type → React component`) |
| Strength | Tree data ≠ behavior; nesting / drop rules |
| Gap | No productized CSS/JS pipeline or editor ops suite |

**Borrow:** node tree vs registry; container nesting rules on the type.

### 1.4 Elementor / Webflow (UX reference)

| Trait | Detail |
| --- | --- |
| Composition | Sections/containers + heading + text + image + button → card-like layouts |
| Layers | Tree / navigator of the document |
| Advanced | Per-widget Custom CSS; page-level custom code |
| Dynamic | Posts / loop widgets bind templates to CMS queries |
| Strength | Power users compose; CSS is theirs; data-driven repeats without forking |

**Borrow:** primitive composition; outline/layers; Advanced + global custom code; iframe isolation; **loop/template binding** pattern (§25) without locking a monolithic blog-card.

### 1.5 Builder.io (reference only)

**Borrow:** published output should feel like real composed React/DOM, not a foreign HTML island.

### 1.6 Prior internal code (`cib_website` page-builder) — lessons

**Keep:**

- `core/registry` + `blocks/<type>/` + `registerBlock`
- Tree ops, history hooks, inspector patterns
- Existing clipboard / keyboard shortcut *seeds* (`useClipboard`, `useKeyboardShortcuts`, `OutlineList`)
- Primitive inventory (heading, text, image, button, container, flex, grid, …)

**Gaps this architecture must fix:**

| Gap | Symptom | Fix in this standard |
| --- | --- | --- |
| **Canvas ≠ Open Page** | Editor canvas looks “distracted” — device chrome, editor-only wrappers, engine/default CSS, selection chrome leaking into perceived page look | Same `RenderPage` + **author CSS only** for page look; editor chrome stays in **parent** overlays, never inside the page document’s visual contract |
| Same-DOM canvas | Page CSS can fight editor UI; publish path diverges | Iframe canvas + shared render |
| Hardcoded `ComponentType` / dual `elements/` + `blocks/` | Drift, harder dynamic blocks | Registry-only types |
| Parallel `*.render.ts` HTML | Two sources of truth | One React `render` |
| **Monolithic composites** (`hero`, `blog-card`) as primary | Can’t remix; styling locked inside one widget; not how Webflow/Elementor composition works | **Primitives + nesting + optional presets** (§9); **repeater + binding** for CMS loops (§25) |
| Ops incomplete / not first-class | Copy/paste/delete/outline exist partially but must be core product requirements | §10 Editor operations |
| **Preview scale** | URL-encoded page JSON fails on large pages; CIB `previewStore` (key in URL, payload in sessionStorage) is the right shape | §20 — draft API and/or IndexedDB; **never** full JSON in URL |
| **Content i18n** | `i18nProps` exists but must become host-configured first-class locales (`en`, `ne`, …) | §19 — beyond Puck’s DIY content i18n |
| **Security surface** | Custom code / bridge / rich text not fully contracted | §22 |
| **Visibility / conditions** | Stub only | §23 |
| **Tenant/plugin registration** | Not a full contract | §24 |

**Borrow:** folder-per-block discipline, registry drift tests, editor chrome patterns, block inventory, keyed preview store idea, `i18nProps` split.

---

## 2. Architectural Decisions (ADR-style)

### ADR-01 — Single React render for canvas and publish

**Decision:** Each block exposes one React component (`render`). Canvas iframe and Open Page / publish both mount it from the registry.

**Still separate:** `ContentFields` (inspector only).

**Optional later:** static HTML via `renderToStaticMarkup` from that same component — never a hand-maintained second template.

### ADR-02 — Canvas iframe + parent-only editor chrome

**Decision:** Page tree renders only inside the sandboxed iframe (or the live document on Open Page). Selection outlines, drag ghosts, hover rings, and toolbars live in the **parent** document, positioned via `canvasBridge` measurements.

**Why:** Prevents the CIB failure mode where editor UI and page UI blur together and the canvas no longer matches Open Page.

### ADR-03 — Author-owned CSS (engine does not decorate the page)

**Decision:** The engine **does not add decorative / theme CSS** for blocks. Users place CSS:

- per block (`Block.customCss`), and/or  
- page-wide (`Page.globalCss`).

**Engine may only:**

- inject what the **author wrote** (after parse + scope + safety),
- apply minimal **structural** attributes needed for editing (`data-block-id`, dropzone markers) that have **no visual effect**,
- optionally map a thin, explicit panel of spacing/typography controls **if** product later wants them — but those must feed the **same** CSS pipeline as publish, never “canvas-only” classes.

**Forbidden:**

- Default pretty card/hero/button skins baked into the engine that Open Page doesn’t use the same way  
- Canvas-only backgrounds, fake browser chrome **inside** the page document (device frames, if any, wrap the iframe from the **outside**)  
- Tailwind utility piles on block `render` that differ between editor and publish hosts  

### ADR-04 — Data tree ≠ registry behavior

`Page` / `Block` JSON never embeds render functions. `BlockDefinition` never embeds page content.

### ADR-05 — Host injects I/O

Engine config (conceptual):

```text
{
  onSave, onPublish,              # persist Page JSON (required) — ADR-14; pass expectedRevision — ADR-16
  onPublishHtml?,                 # optional derived full HTML snapshot — ADR-14
  uploadAsset,
  fetchDynamicBlocks,           # §24 Model B specs
  fetchDataSource,              # §25
  onCreatePreviewDraft?, onResolvePreviewDraft?,
  onCustomCodeChanged,
  capabilities,                 # who may write customCss/customJs / register plugins — §22 / §24
  renderContext,                # locale, device, auth flags, … for §23 — injected, never fetched by engine
}
```

No imports from host `services/`, `store/`, `routes/` inside engine packages.

### ADR-06 — Custom CSS/JS through composers only

**Decision:** Never raw-dump author CSS/JS into tags without parser/composer (CSS) and sandbox wrapping (JS). Full security contract is §22 (sandbox attribute, CSP, network allow-list, remote `url()`, bridge hardening, server re-validation).

### ADR-07 — Primitives first; composites are trees (or presets)

**Decision:** A “card” is **not** primarily a single `card` block with locked internals. It is composed:

```text
container / box
  ├── image
  ├── heading
  ├── text (paragraph)
  └── button  (optional)
```

Optional **presets / snippets** may insert that whole subtree in one palette action — but the stored page JSON remains a normal nested `Block[]` of primitives, fully editable in the outline and canvas.

CMS “blog card grids” use the same primitives inside a **repeater** (§25), not a locked `blog-card` type.

### ADR-08 — Module file convention

| File | Required | Role |
| --- | --- | --- |
| `index.tsx` | Yes | Public component / registration entry |
| `styles.module.css` | Optional | **Editor chrome only** (sidebars, panels). Never page look. |

### ADR-09 — Documentation per capability (Puck-style)

**Decision:** Every public subsystem gets its own doc page under `docs/page-builder/` (or package `docs/`), mirroring Puck’s “one topic → one page” model (Config, Data, Fields, Render, …).

**Why:** Flexible systems only stay robust if integrators can find the contract. A single giant README drifts and hides edge cases (i18n, preview tokens, sandbox).

### ADR-10 — First-class content locales (flexible storage shapes)

**Decision:** Locale is a core editor concern. Host configures the locale list (`en`, `ne`, …). Active locale switches canvas + inspector together via `i18nResolve`.

**Canonical in-engine shape** (always what `RenderPage` / inspector consume after resolve):

```text
i18nProps: {
  en: { title: "Hello", desc: "…" },
  ne: { title: "नमस्ते", desc: "…" },
}
```

**Flexible input / host storage:** Locale payloads may arrive **under the same nested map** or as **different flat keys** as the product requires. Both are supported; `i18nResolve` (and optional host adapters on load/save) normalize to the canonical shape.

| Strategy | Example | When to use |
| --- | --- | --- |
| **A — Nested (same key, per locale)** | `i18nProps.en.desc` / `i18nProps.ne.desc` | Default engine + editor; cleanest |
| **B — Flat suffix keys** | `desc_en` / `desc_ne` (or `desp_eng` / `desp_np` if host legacy naming) | Host DB / CMS columns, imports, APIs that already use suffixes |
| **C — Shared single value** | `props.desc` only | Non-translatable or “one string for all locales” — declared in `sharedProps`, not duplicated per locale |

**Rules:**

- Strategy B suffixes must map to host locale codes via config (e.g. `_en` → `en`, `_np` / `_ne` → `ne`, `_eng` → `en`) — host-defined, not hardcoded forever  
- On save, host may persist either A or B; engine always validates/edits via A after normalize  
- Missing locale → `fallbackLocale`; empty string ≠ missing  
- Do not invent a third parallel system inside block `render` (no `if (lang === 'ne') props.desp_np` switches)

#### Flat-key collision & rename algorithm (mandatory)

When normalizing flat keys → nested `i18nProps`, resolve deterministically:

```text
1. Sort locales by flatSuffixes length DESC (longest match wins).
   e.g. `_eng` before `_en`, so `desc_eng` → en, not leftover `_g`.
2. For each payload key matching /^(.*)_(.+)$/:
   a. Try suffixes in that order; first locale whose flatSuffixes includes the
      suffix segment wins → logicalKey = group1, locale = that code.
   b. If no suffix matches any configured locale → leave key in props as shared
      (or reject if host sets strictFlatKeys: true).
3. Collision (two flat keys map to same locale+logicalKey, e.g. desc_en AND
   desp_eng both → en.desc after alias map):
   a. Prefer the suffix listed FIRST in that locale's flatSuffixes array.
   b. Log a host-visible warning with both keys; never silently merge by
      concatenating values.
4. Nested i18nProps always wins over flat keys for the same locale+logicalKey
   when both are present in one payload.
5. Suffix rename after data exists: host ships a one-shot migration that rewrites
   stored flat keys (or nested maps) — engine does NOT guess historical aliases
   forever. Deprecated suffixes may remain in flatSuffixes as read-aliases until
   migration completes; write path uses only the first (canonical) suffix per locale.
```

**Why:** Puck does not productize content multilingualism. Real products mix nested JSON and flat `*_en` / `*_np` columns — the engine must accept both without forking blocks, and collisions must fail loud/deterministic, not randomly.

### ADR-11 — Preview never puts the page document in the URL

**Decision:** Preview URLs carry only a **short opaque key or draft id** (and optional secret). The page payload lives in:

1. **Host draft/preview API** (preferred for shareable / cross-device preview), or  
2. **sessionStorage / IndexedDB** keyed by that id (tab-local unsaved preview — pattern already proven in CIB `previewStore`).

**Why:** Encoding large multi-locale trees + CSS in query/hash hits hard browser/server URL limits and silently fails on real pages.

### ADR-12 — No client-side eval of remote block render code

**Decision:** Block `render` functions are never created via `eval` / `new Function` / unsigned remote script injection. See §24 Model A (bundled) vs Model B (data-driven). Signed dynamic `import()` from host-controlled URLs is **Phase 19** (`registerSignedBlock`) — opt-in, SRI + origin allow-list, default deny.

### ADR-13 — Web accessibility is mandatory for components

**Decision:** Every block `render` (canvas + Open Page) and all editor chrome controls must follow **WCAG 2.2 Level AA** and the project’s Web Interface Guidelines (keyboard operability, visible focus, name/role/value, labels, contrast, semantics). Accessibility is not optional polish.

**Why:** A page builder that ships inaccessible primitives multiplies inaccessible pages. Editor chrome that cannot be used with keyboard/AT excludes authors.

**Contract:**

| Surface | Requirement |
| --- | --- |
| Block `render` | Semantic HTML (`h1`–`h6`, `button`, `a`, `img` with `alt` from props / i18n, form controls with labels); no click-only `div` buttons |
| Editor chrome | Focusable controls, `aria-*` where needed, Outline/Inspector operable by keyboard |
| Rich text | Sanitized subset must remain keyboard-navigable; links have discernible text |
| Locale / `dir` | Honor `lang` / `dir` from active locale (§19.5) |

Topic doc: `docs/page-builder/concepts/accessibility.md`. New primitives ship an a11y smoke check (§14).

### ADR-14 — Persist JSON by default; full HTML optional

**Decision:** The **canonical saved document** is always the structured **`Page` JSON** (§3) — `blocks`, `meta`, `globalCss` / `globalJs`, `schemaVersion`, locales, visibility, dataBinding, etc. — validated by schema on save/publish. This is what reload, edit, migrate, preview, and Open Page (via `RenderPage`) use.

**Optional:** When the host needs a static snapshot (CDN, email, non-React host, SEO dump, backup), it may also persist **full HTML** (plus composed CSS/JS) generated from the **same** `RenderPage` / html-export path — never hand-authored HTML as the source of truth.

| Artifact | Default? | Role |
| --- | --- | --- |
| **`Page` JSON** | **Yes — always** | Source of truth; editable; migratable; locale-aware |
| **Full HTML (+ CSS/JS bundle)** | **No — on demand** | Derived snapshot via shared render; may lag until regenerate |

**Why:** JSON keeps the builder editable and i18n/visibility/binding intact. Saving only HTML would freeze structure and break re-edit. Puck-style: host owns storage; engine emits JSON on `onSave` / `onPublish`. HTML is an export, not the primary store.

**Host callbacks (extends ADR-05):**

```text
onSave(page: Page)                 # required — persist JSON
onPublish(page: Page)              # required — persist JSON (published revision)
onPublishHtml?(htmlBundle)         # optional — persist derived full HTML when host opts in
```

Engine never chooses a DB format; it always hands the host validated `Page` JSON. HTML generation is opt-in via host config (`persistHtml: true` or calling an export helper).

**Hard rules:**

- Never treat saved HTML as authoritative for re-opening the editor  
- If both are stored, JSON wins on conflict; regenerate HTML from JSON after edits  
- HTML export must use the same composers / `RenderPage` as canvas (ADR-01)  

### ADR-15 — V1 scope is phases 1–11 only

**Decision:** **v1** ships §15 phases **1 through 11** (core → primitives → iframe canvas → editor chrome → clipboard ops → DnD → PreviewPort → Open Page → author CSS → author JS → rich-text sanitizer). Phases **12+** (presets, visibility, Model A/B registration, repeater/data-binding, topic-doc sweep, capability hardening, signed dynamic import) are a **second pass**, gated on a working canvas/DnD/CSS/JS loop with JSON save.

**Why:** §§22–25 are correctly designed but building them before validating the core loop recreates the “architecture without a product” failure. Treat later sections as binding contracts when their phase starts — not as blockers for Phase 1.

| Band | Phases | Ship as |
| --- | ---: | --- |
| **v1** | 1–11 | Required for first usable builder |
| **v1.x / v2** | 12–18 | After v1 parity proven |
| **Gated** | 19 | Only with real white-label plugin need |

### ADR-16 — Optimistic concurrency on save (no silent tab overwrite)

**Decision:** Real-time multiplayer remains out of scope. Multi-tab / multi-device overwrite is in scope as a **minimal contract**: every persisted `Page` carries a monotonic `revision` (or HTTP `ETag`). `onSave` / `onPublish` send the revision the editor loaded; host rejects stale writes with a typed conflict error; editor surfaces reload-or-overwrite UI — never silent last-write-wins across tabs.

```text
Page.revision: string | number   # opaque to engine; host-owned
onSave(page, { expectedRevision }) → { ok, revision } | { conflict, current }
```

Engine keeps `revision` on the in-memory page snapshot after successful save. Undo stack does not invent revisions — only host responses do.

---

## 3. Core Data Model

| Concept | Meaning | Analogy |
| --- | --- | --- |
| **BlockDefinition** | Registered type | Component “class” |
| **Block** | Placed instance | Instance |
| **Page** | Tree + meta + global CSS/JS | Document |
| **Preset** (optional) | Recipe that inserts a nested Block tree | Snippet / template |
| **DataSource** | Host-registered query descriptor + item schema | CMS collection / API feed |
| **Repeater** | Container that clones a template subtree per data item | Elementor Posts / loop |

### Block (instance)

- `id` — stable uuid, never reused  
- `type` — registry key (namespaced for tenant/plugin types — §24)  
- `props` / `i18nProps` — shared vs translatable; host may also supply flat locale keys (`desc_en` / `desc_ne`) normalized by `i18nResolve` (ADR-10 / §19.2.1)  
- `customCss?` / `customJs?` — **primary** author styling / behavior  
- Containers (`box` / `container` / `flex` / `grid`): shared `backgroundImage?` (and related) — §9.1  
- `style?` / `responsiveStyle?` — optional structured controls **only if** they compile into the same published CSS path (ADR-03)  
- `visibility?` — editor + device/locale author intent (see §23)  
- `visibleWhen?` — runtime conditional predicate (see §23)  
- `dataBinding?` — `{ sourceId, params, itemTemplate: Block[] }` on repeater/loop containers (see §25)  
- `children?` — nesting for containers  

### Visibility (author intent — stored on Block)

```text
visibility?: {
  hiddenOnCanvas?: boolean;     # author temporarily hides while editing (still in tree)
  hiddenOnPublish?: boolean;    # never render on Open Page / preview
  hiddenDevices?: Device[];     # e.g. ['mobile']
  hiddenLocales?: string[];     # e.g. ['ne'] — hide for those content locales
}
```

### Runtime condition (evaluated, not a tree mutation)

```text
visibleWhen?: {
  allOf?: VisibilityPredicate[];
  anyOf?: VisibilityPredicate[];
}
# Predicate examples (host-defined keys evaluated against renderContext; item.* only inside repeater — §23.2.1):
# { key: 'auth.isLoggedIn', equals: true }
# { key: 'flags.promo', equals: true }
# { key: 'date.now', between: [startIso, endIso] }
# { key: 'ab.variant', equals: 'B' }
# { key: 'item.cta', notEquals: '' }   # valid only inside itemTemplate
```

### DataBinding (on repeater containers)

```text
dataBinding?: {
  sourceId: string;             # registered DataSource id
  params: Record<string, unknown>;  # limit, filter, sort — inspector-editable
  itemTemplate: Block[];        # template subtree cloned per item at render time
}
```

### DataSource (host-registered, not page JSON)

```text
DataSource = {
  id: string;
  label: string;
  itemSchema: ZodType;          # shape of each item
  # fetch implemented only via host callback fetchDataSource(id, params)
}
```

### Page

- `id`, `blocks[]`, `meta`, `globalCss?`, `globalJs?`, `schemaVersion`
- `revision?` — opaque host concurrency token (ADR-16); required once persistence is wired

### CustomScript

- `code`, `runAt: 'domReady' | 'afterHydration'`, `enabled`

---

## 4. High-Level System Shape

```text
┌────────────────────────────────────────────────────────────┐
│  Host App — auth · persistence · upload · routing · audit  │
│            · capabilities · DataSources · renderContext    │
└──────────────────────────┬─────────────────────────────────┘
                           │ page + callbacks
┌──────────────────────────▼─────────────────────────────────┐
│  @itzsa/page-builder                                        │
│  editor/     chrome: palette, outline, inspector, overlays │
│  canvas/     iframe + bridge + inject author CSS/JS only   │
│  core/       registry, tree, composers, visibility, bind   │
│  blocks/     primitives (+ optional composites if needed)  │
│  presets/    optional recipes → nested Block trees         │
│  render/     shared RenderPage (canvas + preview + Open)   │
│  preview/    PreviewPort (no URL payloads)                 │
└────────────────────────────────────────────────────────────┘
```

### Same renderer, multiple hosts (fixes CIB canvas ≠ open page)

```text
     Author CSS/JS  +  BlockDefinition.render (React)
              + visibilityResolve + dataBinding expand
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
   canvas iframe    preview host    Open Page
```

**Parity rule:** if something is visible as “page content” in the canvas (for the current `renderContext`), it must appear the same on Preview / Open Page. Editor affordances (blue outline, drag handle, drop line, “hidden by condition” ghost) are **overlays in the parent**, not part of the page DOM contract.

---

## 5. Folder Structure (package)

```text
packages/page-builder/
└── src/
    ├── index.ts
    ├── core/
    │   ├── types.ts
    │   ├── registry.ts
    │   ├── blockRegistrationGuard.ts  # namespace + collision + no-eval policy (§24)
    │   ├── fieldAdapterResolve.ts     # Model B kind → ContentFields control mapping, single source of truth (§24.2)
    │   ├── blockTree.ts               # insert / move / remove / clone / find
    │   ├── i18nResolve.ts
    │   ├── visibilityResolve.ts       # visibility + visibleWhen (§23)
    │   ├── dataBinding.ts             # token resolve + template expand (§25)
    │   ├── cssParser.ts
    │   ├── customCssComposer.ts       # author CSS only (+ §22 URL rules)
    │   ├── customJsComposer.ts
    │   ├── sanitizeRichText.ts        # props HTML subset (§22)
    │   ├── clipboard.ts               # clone block subtree with fresh ids
    │   ├── fallbackBlock.tsx          # unknown type renderer (§24)
    │   └── schema/…
    ├── blocks/                        # PRIMITIVES first
    │   ├── box/ | container/ | flex/ | grid/
    │   ├── repeater/                  # loop container primitive (§25)
    │   ├── heading/ | text/ | image/ | button/
    │   ├── divider/ | spacer/ | …
    │   └── index.ts
    ├── presets/                       # optional — insert composed trees
    │   ├── card.ts
    │   ├── hero.ts
    │   └── index.ts
    ├── canvas/
    │   ├── CanvasFrame/
    │   ├── CanvasDocument.tsx
    │   ├── canvasBridge.ts            # origin-checked postMessage (§22)
    │   ├── injectStyles.ts            # emits nonce-tagged tags, no unsafe-inline (§22.2)
    │   ├── injectScripts.ts           # emits nonce-tagged tags, no unsafe-inline (§22.2)
    │   └── sandboxPolicy.ts           # sandbox + CSP + network allow-list (§22)
    ├── editor/
    │   ├── PageBuilder/
    │   ├── components/
    │   │   ├── ElementsPanel/
    │   │   ├── OutlineTree/           # dimmed rows for hidden (§23)
    │   │   ├── BlockInspectorPanel/
    │   │   ├── GlobalCodePanel/
    │   │   ├── SelectionOverlay/
    │   │   └── …
    │   └── hooks/
    │       ├── useDragAndDrop.ts
    │       ├── useBlockHistory.ts
    │       ├── useClipboard.ts
    │       ├── usePageHydration.ts
    │       └── useKeyboardShortcuts.ts
    ├── render/
    │   └── RenderPage.tsx             # visibility + dataBinding + fallback
    ├── preview/
    │   ├── types.ts
    │   ├── createPreviewSession.ts
    │   └── loadPreviewSession.ts
    ├── migrations/
    ├── constants.ts
    └── utils.ts

# Sibling docs (integrator-facing, Puck-style topic pages) — see §18.1
docs/page-builder/
├── index.md
├── concepts/…
├── editor/…
├── api/…
└── guides/…
```
**Rule:** ~300 lines max per file; split on block/feature boundaries.

### Per-block surface

| Piece | Required | Role |
| --- | --- | --- |
| `index.tsx` | Yes | `registerBlock` |
| `*Element.tsx` (`render`) | Yes | Canvas **and** Open Page — **unstyled shell** + content from props |
| `*ContentFields.tsx` | Yes | Inspector Content tab |
| `styles.module.css` | Optional | **Editor chrome only**, never page look |
| `*.test.ts` | Yes | Smoke + registry drift |

Block `render` outputs semantic structure (e.g. `<h2>`, `<p>`, `<img>`, `<div data-block-id>`). **Look comes from author CSS.** Rich-text props pass through `sanitizeRichText` (§22). **Accessibility (ADR-13)** is mandatory on every `render` and inspector control.

---

## 6. Style System — Author CSS First

### Primary: Custom CSS (per-block + global)

- Advanced tab → `Block.customCss`  
- Global Code panel → `Page.globalCss`  

Pipeline:

```text
raw author CSS
  → cssParser (reject invalid; §22 remote url / @import / data: rules)
  → customCssComposer
       • per-block: scope to [data-block-id="…"]
       • global: unscoped within the page document (still iframe-isolated in editor)
       • allow @media
       • reject @import / parent-escape selectors / disallowed url()
  → injectStyles (canvas iframe) AND Open Page <head>  — same output
```

### What the engine must NOT do

- Ship default CSS modules that style headings/cards/buttons differently in the editor  
- Add “demo” padding/borders/shadows so the canvas looks designed before the user wrote CSS  
- Maintain a second CSS path for canvas vs Open Page  

### Optional later: structured style panel

Only if product needs non-technical controls. Must compile into the **same** published CSS artifacts. Until then, **Custom CSS is enough** — matches “user will place the CSS for each.”

### Precedence

`block.customCss` (most specific) → optional compiled panel style → `Page.globalCss` (least specific / loaded first).

---

## 7. Custom JS — Sandboxed

Summary (full contract: **§22**):

- Runs only in canvas iframe or Open Page document — never in editor parent.
- `sandboxPolicy.ts` single source of truth; **no** `allow-same-origin` footgun.
- Shape-validate `CustomScript` only; isolation is the control.
- Network access **default-deny**; host may supply an explicit allow-list.
- Kill switch `enabled`; audit via `onCustomCodeChanged`; capability gates on who may author JS (§22 / §24).

---

## 8. Block Registry

Dispatcher-only consumers. Live registry `.refine()` for `Block.type` — never a frozen static enum of all types.

`BlockDefinition` (conceptual): `type`, `label`, `icon`, `category`, `isContainer?`, `canAcceptChild?`, `defaultProps`, `propsSchema`, `render`, `ContentFields`, `source: 'core' | 'tenant' | 'plugin'`, optional `capabilities`.

Custom / tenant / plugin registration lifecycle: **§24**. Unknown types: **fallback renderer**, never crash.
---

## 9. Primitive Composition (Card, Hero, etc.)

### Problem in CIB

Types like `hero` and `blog-card` baked layout + content into one widget. Users could not freely rearrange “image above title” vs “title beside image” without a new block type. That is the opposite of Webflow/Elementor composition.

### Rule

**Primitives are the product.** Composites are either:

1. **User-built trees** of primitives, or  
2. **Presets** that insert a tree once, then dissolve into normal editable blocks, or  
3. **Repeater + binding** (§25) that clones a primitive template per CMS/API item.

### Primitive set (minimum)

| Primitive | Role |
| --- | --- |
| `box` / `container` | Generic div/section — **first-class background image** (and color) via shared props + author CSS; drop target for children |
| `flex` / `grid` | Layout containers — same background-image support as `box`/`container` |
| `repeater` | Loop container — `dataBinding` (§25) |
| `heading` | Titles |
| `text` | Paragraph / rich text (sanitized — §22) |
| `image` | Content media (foreground `<img>`), distinct from container backgrounds |
| `button` / `link` | Actions |
| `divider` / `spacer` | Structure |

### 9.1 Container background image (gap vs other builders)

**Decision:** `box` / `container` / `flex` / `grid` support a **background image** as a normal shared prop (and/or author CSS), not only as a separate Image block or a locked “section with BG” mega-widget. Many builders (including gaps in CIB / limited Puck setups) make background imagery awkward on generic containers — here it is intentional and first-class.

| Mechanism | Role |
| --- | --- |
| `props.backgroundImage` (URL) | Shared; inspector upload/URL field; applied as CSS `background-image` on the container root |
| Optional `props.backgroundSize` / `position` / `repeat` | Shared layout hints, or left to **author CSS** |
| `Block.customCss` | Full escape hatch (`background: url(...) center/cover`) — same composer rules (§22) |

**Rules:**

- Background image ≠ `image` primitive (foreground content with `alt`, in flow). BG is decorative/layout on the container; if the image conveys meaning, use an `image` child (or provide accessible text elsewhere).  
- Asset URLs go through host `uploadAsset` / allow-listed `img-src` (§22).  
- Open Page and canvas use the same props → same background (parity).  
- Nested containers may each have their own background independently.  

### Example — Card (not a locked widget)

```text
box                          # card shell — user CSS: border, radius, shadow, padding
├── image                    # thumbnail
├── heading                  # title
├── text                     # description
└── button                   # CTA
```

Palette may offer **Preset: Card** that inserts this tree with empty defaults. After insert, Outline Tree shows four (or five) nodes; each can be deleted, restyled with CSS, or moved.

### Example — Hero

```text
box / section
├── heading
├── text
├── button
└── image   (optional, position via layout + CSS)
```

### When is a dedicated composite block allowed?

Only when a real interaction can’t be expressed as primitives (e.g. a tightly coupled slider with internal state). Default answer: **prefer primitives + preset / repeater**. If a composite ships, it must still use the same registry/render/CSS rules and should expose children where possible. Tenant-specific composites: §24.

---

## 10. Editor Operations (first-class)

These are product requirements, not afterthoughts. CIB had partial hooks — this standard makes them mandatory.

### 10.1 Selection

- Click block on canvas (bridge → parent) selects `selectedId`
- Outline click selects the same id
- Selection chrome = parent `SelectionOverlay` only

### 10.2 Delete

- Delete / Backspace removes selected block (and subtree if container)
- Confirm only if product requires it for non-empty containers
- Goes through `blockTree.remove` + history

### 10.3 Copy / Cut / Paste / Duplicate

| Action | Behavior |
| --- | --- |
| Copy | Deep-clone selected subtree into clipboard (serialized Block JSON) |
| Cut | Copy + remove |
| Paste | Insert clone under selection’s parent (or into selected container) with **new ids** for every node |
| Duplicate | Copy + paste in place (sibling after) |

Implementation notes:

- `core/clipboard.ts` / `useClipboard` — regenerate all `id`s on paste (never reuse)
- Preserve `customCss` / `customJs` / props / children / `visibility` / `visibleWhen` / `dataBinding`
- Keyboard: Ctrl/Cmd+C, X, V, D (duplicate) via `useKeyboardShortcuts`
- Invalid paste target → no-op or fall back to root (documented rule); respect `canAcceptChild`

### 10.4 Tree hierarchy (Outline / Layers)

- Left sidebar **OutlineTree** mirrors `Page.blocks` nesting
- Expand/collapse containers
- Click to select; optional drag-reorder in outline (same `blockTree` ops as canvas)
- Labels from `BlockDefinition.label` + optional content preview (first heading text, etc.)
- Must stay in sync with canvas selection
- **Hidden / conditionally invisible blocks still appear in the outline**, dimmed (see §23) — hiding is never a delete

### 10.5 History

- Undo/redo wraps all mutating ops (DnD, delete, paste, prop edits, CSS edits, visibility, binding params)

---

## 11. Drag and Drop

```text
Hit-test inside iframe → canvasBridge → useDragAndDrop → blockTree → history → RenderPage
Overlays (ghost, drop line) drawn in PARENT only
```

- No `switch (type)` in DnD — use `canAcceptChild`
- Palette drag inserts primitive, **preset tree**, or (later) registered custom types (§24)

---

## 12. State and Package Boundaries

| Concern | Where |
| --- | --- |
| Page document + undo | `useBlockHistory` |
| Clipboard | `useClipboard` (session memory; not persisted unless product asks) |
| UI chrome state | Lightweight editor state only |
| Server I/O / auth / capabilities | Host callbacks only |
| `renderContext` | Host-injected for §23 — engine evaluates only |
| **Persistence** | Host stores **`Page` JSON by default** (ADR-14); optional full HTML snapshot via `onPublishHtml?` |
| **Revision / conflict** | `Page.revision` + `expectedRevision` on save — ADR-16; no silent multi-tab overwrite |

---

## 13. Schema, Migrations, Validation

Load → migrate by `schemaVersion` → parse. Publish uses the same parse. Failures are loud, never silent drops.

**Default persist shape:** validated `Page` JSON (§3 / ADR-14), including opaque `revision` for concurrency (ADR-16). Optional HTML is derived after a successful parse/render — never saved instead of JSON.

**Server-side (host):** re-validate `Page` / `Block` schemas including `customCss` / `customJs` / `visibleWhen` / `dataBinding` on save and publish — never trust client-only validation (§22).

---

## 14. Testing Requirements

| Test | Guards |
| --- | --- |
| Block smoke | `render` + `ContentFields` + `propsSchema` |
| Registry drift | Required fields present |
| **Canvas / preview / Open Page parity** | Same fixture + same author CSS → comparable DOM |
| CSS composer safety | Malformed, `@import`, escape selectors |
| **Remote `url()` exfiltration** | `url(https://…)`, `url(data:…)`, `@font-face` remote src rejected or allow-listed per §22 |
| Sandbox policy | Exact `sandbox` string; **no** `allow-same-origin`; CSP regression |
| **Bridge origin spoof** | Messages from wrong origin / invalid schema rejected |
| **Rich-text XSS** | Script / event-handler HTML in text props stripped by sanitizer |
| Clipboard | Paste regenerates ids; deep trees; history integration |
| Outline | Tree mirrors nested blocks; selection sync; **dimmed hidden nodes still listed** |
| Preset expand | Card preset inserts expected primitive tree |
| **Locale resolve** | `en` / `ne` (+ extra) fallback; missing key → fallbackLocale; Unicode Nepali round-trip; **flat `desc_en`/`desc_ne` (or host aliases) normalize to nested `i18nProps` and back** |
| **Preview without URL payload** | Fixture larger than typical URL limits still opens via draft id / store key; assert URL length stays bounded |
| **Visibility parity** | `visibleWhen` + `visibility` evaluate identically on canvas (ghost), preview, Open Page (omit); tree data retained |
| **Registration guard** | Duplicate type errors; namespaced types; fetched JS cannot become `render` via eval |
| **Unknown block fallback** | Missing type → fallback UI; page does not crash; tree preserved |
| **Repeater binding** | Template once per item; empty/error/loading states match across hosts; binding tokens do not emit unescaped HTML |
| **Cross-strategy data parity** | Strategy A (host-resolved) and Strategy B (client `fetchDataSource`) expand identical item data to identical DOM output — same order, same token resolution, same empty/loading/error markup, for one shared fixture DataSource |
| **Item-scoped visibility** | `visibleWhen` referencing `item.*` only resolves inside repeater expansion; same predicate outside a repeater fails safe (hidden), never crashes |
| **CSP nonce regression** | `script-src`/`style-src` contain no `'unsafe-inline'`; emitted tags carry matching per-render nonce; stale/mismatched nonce is rejected by the browser (test via CSP violation report capture) |
| **Binding token grammar** | Literal `{{` preserved when not a valid `{{item.path}}`; malformed/unclosed → literal; resolved values not re-scanned; unknown path → `''` |
| **Save conflict** | Stale `expectedRevision` → conflict result; editor does not overwrite silently |

---

## 15. Build Order

**v1 = phases 1–11** (ADR-15). Do not start phases 12+ until canvas / DnD / author CSS / JSON save parity is proven.

| Phase | Band | Deliverable |
| --- | --- | ---: |
| 1 | **v1** | `core` types, registry, tree, schemas, **locale config + i18nResolve** |
| 2 | **v1** | Primitives: box/container, flex, grid, heading, text, image, button (translatable vs shared props) |
| 3 | **v1** | Iframe canvas + shared `RenderPage` (read-only) + **sandboxPolicy / CSP nonce baseline (§22)** |
| 4 | **v1** | Editor chrome: palette, **OutlineTree**, inspector Content (**locale switcher**), history |
| 5 | **v1** | **Delete + copy/cut/paste/duplicate** + shortcuts (preserve `i18nProps`) |
| 6 | **v1** | DnD + bridge relay + **bridge origin checks** |
| 7 | **v1** | **PreviewPort** — draft API and/or keyed store; **forbid URL payloads**; prove parity |
| 8 | **v1** | Open Page host — visual parity with author CSS |
| 9 | **v1** | Custom CSS composers + Advanced + Global CSS (author-owned) + **§22 CSS URL rules** |
| 10 | **v1** | Custom JS + sandbox tests + network **default-deny** |
| 11 | **v1** | **Rich-text sanitizer** + server-side custom code re-validation + **revision/conflict on save (ADR-16)** |
| 12 | v1.x | Presets: Card, Hero (trees of primitives) |
| 13 | v1.x | **§23 Visibility** — `visibility` + `visibleWhen` + outline dimming + `renderContext` |
| 14 | v1.x | **§24 Model A** — namespaced `registerBlock`, collision errors, fallback renderer, capability gates |
| 15 | v1.x | **§25 Repeater + DataSource binding** (after presets — same primitive-tree pattern) |
| 16 | v1.x | **§24 Model B** — `fetchDynamicBlocks` JSON specs (composition of existing primitives only) |
| 17 | shipped | **Topic docs** under `docs/page-builder/` (Puck-style) for every shipped capability |
| 18 | shipped | Capability hardening (`createProductionCapabilities`) + core primitives incl. quote/alert + a11y smoke |
| 19 | shipped (opt-in) | Signed host-controlled dynamic `import()` for custom render (never eval); **default deny** |

---

## 16. Hard Rules Checklist (before any PR)

- [ ] Canvas page look === Preview === Open Page for the same JSON + author CSS + active locale + `renderContext`  
- [ ] **Canonical persistence is `Page` JSON** (schema-validated); full HTML is optional derived export only — never the sole source of truth for re-edit (ADR-14)  
- [ ] **v1 ships phases 1–11 only**; phases 12+ gated on working canvas/DnD/CSS/JSON save (ADR-15)  
- [ ] Saves send `expectedRevision`; conflicts surface to the author — no silent multi-tab overwrite (ADR-16)  
- [ ] Engine does **not** add decorative page CSS; users place CSS  
- [ ] Editor chrome (outlines, handles) stays in parent overlays — not inside page visual contract  
- [ ] Canvas / preview / Open Page use the same React `render`  
- [ ] No `switch` on block type outside registry dispatch  
- [ ] Prefer primitives + presets / repeater over new monolithic composites  
- [ ] Delete, copy, paste, duplicate, outline tree are supported and history-aware  
- [ ] Translatable fields use `i18nProps` (canonical); flat keys like `desc_en` / `desc_ne` / `desp_eng` / `desp_np` are supported via host-configured normalize on load/save (ADR-10) — never hardcoded `switch (lang)` inside block `render`  
- [ ] Layout containers support **background image** as shared props and/or author CSS (§9.1); canvas/Open Page parity  
- [ ] Preview URL does **not** contain serialized page JSON — only opaque id/key  
- [ ] Custom CSS/JS only via composers + inject helpers  
- [ ] Canvas iframe `sandbox` is exactly the contracted value and **excludes** `allow-same-origin`  
- [ ] Author JS network access is **default-deny** unless host allow-list is set  
- [ ] Author CSS rejects `@import` and disallowed remote / exfiltrating `url(...)` per §22  
- [ ] `canvasBridge` validates origin + message schema on both sides  
- [ ] Host **server-side** re-validates `customCss` / `customJs` on save/publish  
- [ ] Rich-text / HTML props pass through the sanitization contract before render  
- [ ] Who may author custom CSS/JS / register plugin blocks is gated by host `capabilities`  
- [ ] Attaching/activating `dataBinding` on any block is gated by host capability `allowDataBinding`; ungated `dataBinding` present in loaded JSON renders inert (template only, no fetch), never crashes or silently queries  
- [ ] Composer-emitted `<script>`/`<style>` use a per-render nonce; CSP never includes `'unsafe-inline'` for `script-src`/`style-src`  
- [ ] Conditional visibility evaluated identically across canvas/preview/Open Page; **hidden blocks retain full tree data**  
- [ ] `visibleWhen` predicates referencing `item.*` only evaluate inside repeater expansion scope; never leak item data outside that subtree  
- [ ] Custom block types are **namespaced**; registration **never** client-side-evals fetched code as `render`; unknown types use **safe fallback**, never crash the page  
- [ ] Repeater/blog-card patterns use primitives + binding — not locked mega-widgets  
- [ ] Binding token resolution does not emit unescaped HTML from item data  
- [ ] Block `render` and editor chrome follow **web accessibility** guidelines (WCAG 2.2 AA / Web Interface Guidelines) — ADR-13  
- [ ] Live registry refine for `Block.type`  
- [ ] Engine does not import host `services/` / `store/` / `routes/`  
- [ ] `styles.module.css` only for editor chrome modules, never page decoration  
- [ ] New public capability ships with a **topic doc** page (or updates an existing one)  
- [ ] Subsystem remains flexible / dynamic / robust — no hardcoding that blocks new locales, blocks, data sources, or preview backends  

---

## 17. Comparison Summary

| Dimension | GrapesJS | Puck | Elementor/Webflow | CIB (today) | **This builder** |
| --- | --- | --- | --- | --- | --- |
| Canvas = publish look | Strong (iframe) | Usually | Strong | **Weak / distracted** | **Required parity** |
| Who owns CSS | Author + composer | Mostly component | Author Advanced | Mixed / engine-ish | **Author only** |
| Composition | HTML components | Registered React | Primitives + sections | Mega-widgets + primitives | **Primitives + presets** |
| Content i18n | DIY | **Weak / DIY** | Varies | Partial (`i18nProps`) | **First-class en/ne/…** |
| Preview large pages | Storage/API | **URL data often breaks** | Draft/API | `previewStore` key | **Token + storage/API** |
| Docs model | Module docs | **Per-topic docs** | Help center | Sparse | **Per-topic like Puck** |
| Outline / layers | Yes | Partial | Yes | Partial (`OutlineList`) | **First-class** |
| Copy/paste blocks | Yes | Yes | Yes | Partial hooks | **First-class** |
| Security (sandbox/CSP/bridge) | Strong-ish | Partial | Productized | Incomplete | **§22 contracted** |
| Conditional visibility | Traits/DIY | DIY | Strong | Stub | **§23 first-class** |
| Tenant/plugin register | Plugins | Config merge | Widgets/hooks | Limited | **§24 Model A/B** |
| **Dynamic data-bound content (Elementor Posts-widget equivalent)** | Partials / DIY | DIY / external | **First-class loops** | Monolithic `blog-card` | **Repeater + DataSource + primitive template (§25)** |

---

## 18. Documentation Standard (like Puck)

Every architecture point must be **designed and documented** so the system stays flexible, dynamic, and robust — not only implemented in code.

### 18.1 Doc layout (package / monorepo)

```text
docs/page-builder/
├── index.md                 # overview + quick start
├── concepts/
│   ├── data-model.md        # Block, Page, Preset, DataSource
│   ├── registry.md
│   ├── render-parity.md     # canvas === preview === Open Page
│   ├── author-css.md
│   ├── composition.md       # primitives + presets
│   ├── locales.md           # en / ne; nested vs flat keys (desc_en / desc_ne)
│   ├── preview.md           # token + storage/API — never URL payload
│   ├── persistence.md       # JSON default + optional HTML snapshot (ADR-14)
│   ├── security.md          # sandbox, CSP nonce, bridge, sanitizer (§22)
│   ├── visibility.md        # visibility + visibleWhen + item-scoped (§23)
│   ├── data-binding.md      # DataSource, repeater, tokens (§25)
│   └── accessibility.md     # WCAG 2.2 AA / Web Interface Guidelines (ADR-13)
├── editor/
│   ├── outline-tree.md
│   ├── clipboard.md
│   ├── drag-and-drop.md
│   └── inspector-fields.md  # dynamic field system
├── api/
│   ├── PageBuilder.md
│   ├── registerBlock.md
│   ├── host-callbacks.md    # incl. fetchDataSource, capabilities, renderContext
│   ├── field-types.md
│   └── sandbox-policy.md
└── guides/
    ├── add-a-block.md
    ├── add-a-locale.md
    ├── custom-css-js.md
    ├── register-custom-block.md          # §24 Model A
    ├── dynamic-block-data-binding.md     # §24 Model B
    └── dynamic-blog-card.md              # §25 Elementor-style loop
```

### 18.2 Rules for each doc page

| Rule | Detail |
| --- | --- |
| One topic | Like Puck’s Data / Config / Fields pages — one concern per file |
| Contract first | Inputs, outputs, invariants, failure modes |
| Flexibility | How a host extends it without forking |
| Robustness | Limits (payload size, nesting depth, locale fallback) and what happens when exceeded |
| No silent drift | If code changes the contract, the matching doc page updates in the same PR |

Architecture (`ARCHITECTURE-PAGE-BUILDER.md`) is the **design authority**. `docs/page-builder/*` is the **integrator-facing** expansion of each point.

---

## 19. Fields System — Dynamic, Robust, Locale-Aware

### 19.1 Why not “Puck fields only”

Puck fields are powerful for single-locale props. Multilingual content is left to each app (`resolveFields`, `{ en, fr }` nested objects, external CMS). That is **not robust** when the product needs English + Nepali (+ more) on every text-like field across the library.

### 19.2 Field model

| Kind | Storage | Example |
| --- | --- | --- |
| **Shared** | `block.props[key]` | `url`, `imageSrc`, `openInNewTab`, layout flags, **container `backgroundImage`** |
| **Translatable (canonical)** | `block.i18nProps[locale][key]` | `title`, `desc` / `body`, `buttonLabel`, `alt` |
| **Translatable (flat host form)** | `desc_en`, `desc_ne` / `desp_eng`, `desp_np`, … | Same fields; normalized into `i18nProps` on load (ADR-10) |
| **Page meta** | `page.meta` locale maps (or flat meta keys) | title, description, OG |

Declared on `BlockDefinition`:

- `translatableProps: string[]` — logical keys (`desc`, not `desc_en`)
- `sharedProps: string[]`
- `propsSchema` validates shape; locale maps validated dynamically against **host locale config**

### 19.2.1 Same data vs different keys (desc / desc_en / desc_ne)

Authors and hosts may pass locale content either way:

```text
# Same logical field "desc" — nested (preferred in Page JSON)
i18nProps: {
  en: { desc: "English description" },
  ne: { desc: "नेपाली विवरण" },
}

# OR flat / different keys (host import or legacy columns) — normalized by i18nResolve
props or raw payload: {
  desc_en: "English description",   # or desp_eng
  desc_ne: "नेपाली विवरण",           # or desp_np
}

# OR one value for all locales
props: { desc: "Same everywhere" }  # sharedProps includes "desc"
```

Inspector always edits the **logical** key (`desc`) for the active locale. Persistence round-trip may rewrite to flat keys if the host configures `localeStorage: 'flat' | 'nested'` (default `'nested'`). Collision / longest-suffix / rename rules: **ADR-10 flat-key algorithm** (mandatory).

### 19.3 Host locale config (dynamic)

```text
locales: [
  { code: 'en', label: 'English', dir: 'ltr', flatSuffixes: ['en', 'eng'] },
  { code: 'ne', label: 'नेपाली', dir: 'ltr', flatSuffixes: ['ne', 'np'] },
  // host may add hi, zh, … without engine release
]
defaultLocale: 'en'
fallbackLocale: 'en'   # resolve missing keys → fallback, never crash
localeStorage: 'nested' | 'flat'   # how onSave serializes translatable fields (ADR-10)
```

- Active locale drives canvas `RenderPage` + inspector Content fields.
- Switching locale does **not** duplicate the tree — same structure, different `i18nProps` slice (or flat key set after normalize).
- Missing translation → `fallbackLocale` value (documented); empty string is allowed and distinct from missing.
- Editor chrome strings (Publish, Outline, …) use a separate UI dictionary — also locale-switchable — distinct from **content** i18n.
- Flat suffix aliases (`_np` ↔ `ne`, `_eng` ↔ `en`) are host-configurable so legacy `desp_np` / `desp_eng` imports work without renaming every column at once.

### 19.4 Dynamic / robust field behavior

- Fields resolve from the registry + block definition — no hardcoded per-type switch in the inspector.
- Dynamic / Model B blocks declare field specs; ContentFields are generated or adapted — same locale rules.
- Validation: Zod per props schema; locale codes must be in the host allow-list.
- Copy/paste preserves full `i18nProps` maps.
- Large locale sets: only the active locale’s inputs mount in the inspector (performance); all locales remain in data.

### 19.5 Nepali / Unicode

- All text fields must accept full Unicode (Nepali) without sanitizer stripping **safe text**.
- HTML-capable rich text still runs through `sanitizeRichText` (§22) — Unicode text preserved; active script content removed.
- Fonts for canvas/Open Page are **author/host concern** (author CSS or host font loading) — engine does not bake a single font stack that fights the published site.
- `dir` / `lang` attributes on the page root follow active locale when rendering.

---

## 20. Preview Architecture — Large Pages Without URL Payloads

### 20.1 The Puck / URL problem

Passing the full page document through the URL (query string or hash) fails for real CMS pages:

| Limit | Typical ceiling |
| --- | --- |
| Browser URL length | Often ~2KB–64KB practical; varies by browser & proxies |
| Multi-locale page JSON | Easily hundreds of KB with CSS, embeds, deep trees |
| Failure mode | Truncation, 414 URI Too Long, blank preview — **silent or cryptic** |

**Hard rule:** Preview URL may contain `previewId` / `draftId` / `secret` only — **never** the serialized `Page`.

### 20.2 Supported strategies (engine contract)

The engine defines a **PreviewPort** the host implements. Preferred order:

#### A — Draft / Preview API (preferred, shareable)

```text
Editor "Preview"
  → host upsertDraft(page) → returns draftId
  → open /preview?draft=<draftId>&secret=…
  → preview route loads JSON from server
  → RenderPage (same as canvas / Open Page)
```

Aligns with Next.js Draft Mode / CMS preview patterns: short URL, server holds payload, works cross-device when authorized.

#### B — Tab-local store (unsaved / instant preview)

Pattern proven in CIB `previewStore`:

```text
Editor "Preview"
  → store payload in sessionStorage or IndexedDB under key pb-preview:<id>
  → open /preview?key=<id>     ← id only in URL
  → preview page reads store by key, then renders via RenderPage
```

Use **IndexedDB** when payload may exceed `sessionStorage` quota (~5MB). URL still only carries the key.

#### C — Forbidden

- `?data=<base64 entire page>`
- Hash-routed full JSON documents
- Relying on “it works for small demos” as the product design

### 20.3 Preview vs canvas vs Open Page

| Surface | Data source | Renderer |
| --- | --- | --- |
| Canvas | Live editor state | `RenderPage` in iframe |
| Preview | Draft API or keyed store | **Same** `RenderPage` |
| Open Page | Published persistence | **Same** `RenderPage` |

Parity tests must include preview host, not only canvas vs publish.

### 20.4 Host callbacks

```text
onCreatePreviewDraft?(page) => { draftId }
onResolvePreviewDraft?(draftId) => page | null
// or engine-assisted tab store helpers exported for hosts that choose strategy B
```

Engine never assumes a particular DB — only the port.

---

## 21. Capability Extensions Index

Sections **§22–§25** extend the engine contract for production CMS use. Read them as mandatory design authority alongside §§0–20:

| Section | Topic |
| --- | --- |
| **§22** | Security model — sandbox, CSP, network, CSS URL rules, bridge, sanitizer, capabilities |
| **§23** | Visibility & conditional rendering — `visibility`, `visibleWhen`, `renderContext` |
| **§24** | User-registered custom blocks — Model A (bundled) / Model B (data-driven); no eval |
| **§25** | Dynamic data-bound loops — DataSource + repeater + binding tokens (Elementor Posts equivalent) |

Glossary terms for these capabilities: **§26**.

---

## 22. Security Model (canvas, author CSS/JS, network)

**Decision:** Treat author CSS/JS, the canvas bridge, rich-text props, and block registration as a single security surface. Isolation is by construction (iframe sandbox + composers + host capabilities), not by hoping authors write safe code. ADR-06 remains: composers always stand between author input and the DOM.

**Why:** Custom CSS/JS and plugin blocks are the highest-risk features in a page builder. A missing `allow-same-origin`, a lax CSP, an open `connect-src`, a spoofable `postMessage`, or `eval` of fetched render code turns the editor into an XSS / data-exfiltration platform.

### 22.1 Canvas iframe `sandbox` (editor)

| Surface | `sandbox` attribute (exact contract) |
| --- | --- |
| **Editor canvas iframe** | `allow-scripts allow-forms` — **never** `allow-same-origin`; **never** `allow-top-navigation` / `allow-popups` unless a future ADR explicitly adds and documents them |
| **Open Page** | Default: **top-level document** (not iframed). Author CSS/JS still go through the same composers. If the host embeds Open Page in an iframe (e.g. multi-tenant preview chrome), that iframe must use the **same** sandbox string as the editor canvas |

`sandboxPolicy.ts` is the **single source of truth** for this string. Changing it requires an architecture amendment + regression test.

### 22.2 CSP for the canvas document

Conceptual default (host may tighten further; must not loosen below this floor without ADR):

| Directive | Policy |
| --- | --- |
| `default-src` | `'self'` |
| `script-src` | `'self' 'nonce-<per-render-nonce>'` — **no** `'unsafe-inline'`. `customJsComposer` emits inline `<script nonce="...">` only with a nonce generated per render/request; the same nonce is reflected into the CSP header by the host. No arbitrary third-party script hosts by default. |
| `style-src` | `'self' 'nonce-<per-render-nonce>'` — **no** `'unsafe-inline'`. `customCssComposer`-emitted `<style>` tags carry the same per-render nonce. |
| `img-src` | `'self' data: blob:` + host-configured asset CDN allow-list |
| `font-src` | `'self' data:` + host-configured font allow-list |
| `connect-src` | **default `'none'`** (or empty deny) — see §22.3 |
| `frame-src` | `'none'` by default; host allow-list for intentional embeds |
| `frame-ancestors` | `'self'` — canvas iframe must not be framed elsewhere |
| `object-src` | `'none'` |
| `base-uri` | `'none'` |

**Decision:** Composer-emitted CSS/JS use a per-render cryptographic nonce rather than blanket `'unsafe-inline'`. This closes the main CSP-bypass gap while still allowing author-authored inline styles/scripts through the composer pipeline (never raw, unwrapped author input). Nonce generation is a host responsibility, reflected identically into both the emitted markup and the CSP response header / iframe CSP. Nonces are never reused across requests/sessions.

#### Who mints the nonce, and when (concrete sequence)

Open Page (SSR / RSC) and the editor canvas iframe need different plumbing — same contract, different mint site:

```text
Open Page (SSR / server render)
  1. Host request handler mints nonce = random (e.g. 128-bit base64)
  2. Host sets CSP header / meta: script-src 'nonce-<n>'; style-src 'nonce-<n>'
  3. Host calls RenderPage / injectStyles / injectScripts with { nonce }
  4. Composers emit <style nonce="n"> / <script nonce="n">
  5. Response body + CSP header share the SAME n for this request only

Editor canvas iframe (client-held, often no full document navigation)
  1. Parent editor calls host callback mintCanvasNonce() OR
     requests GET /api/page-builder/csp-nonce (host) → { nonce, csp }
  2. Parent passes nonce into CanvasFrame when writing/srcdoc-updating the iframe
     (or posts CANVAS_INIT { nonce } over canvasBridge before inject)
  3. Canvas document CSP is applied via:
       - <meta http-equiv="Content-Security-Policy" content="… nonce-…"> inside srcdoc, OR
       - iframe csp attribute where supported, OR
       - blob URL response headers from a host-served canvas shell
  4. injectStyles / injectScripts inside the iframe use that nonce on tags
  5. On each full canvas document rebuild (page load, hard refresh of frame),
     mint a NEW nonce — do not reuse across rebuilds
  6. Soft React re-renders that only patch block DOM do NOT remint; they keep
     the current frame nonce until the next document rebuild

FORBIDDEN
  - Math.random() nonces; client-only nonce with no matching CSP on the frame
  - Putting the nonce in the parent page CSP and expecting it to apply inside
    a sandboxed opaque-origin iframe (it will not)
  - Reusing one app-lifetime nonce for all users/sessions
```

`sandboxPolicy.ts` exports the CSP template with a `{{nonce}}` placeholder; host / CanvasFrame fills it at mint time.

### 22.3 Author JS network access

**Decision:** Author JS may **not** call `fetch` / `XMLHttpRequest` / `WebSocket` unless the host configures an explicit allow-list in `sandboxPolicy` / CSP `connect-src`.

| Mode | Behavior |
| --- | --- |
| **Default** | Deny network from author scripts (`connect-src` empty / `'none'`) |
| **Allow-list** | Host passes `allowedConnectOrigins: string[]` → reflected into CSP `connect-src` only |

No wildcard `*` for `connect-src` in production configs.

### 22.4 Author CSS remote references (`cssParser` rules)

| Construct | Rule |
| --- | --- |
| `@import` | **Reject** always (network fetch of arbitrary CSS) |
| `url(http…)` / `url(https…)` | **Reject by default**; optional host allow-list for known asset/font CDNs (same list as `img-src` / `font-src` where applicable) |
| `url(data:…)` | Allow only for **images/fonts** with size cap; reject `data:text/html`, `data:application/javascript`, and SVG-with-script patterns |
| `url(//…)` protocol-relative | **Reject** |
| `@font-face` `src` | Same as `url()` rules — remote fonts only if on host font allow-list |
| Selectors targeting `html`, `body`, `iframe`, `parent`, `:root` escapes aimed at chrome | Strip / reject per composer scope rules; iframe isolation remains the backstop |

### 22.5 `canvasBridge` hardening

| Control | Requirement |
| --- | --- |
| Origin / source check | Parent accepts messages only when `event.source === iframe.contentWindow` (primary trust check when the frame has an opaque origin without `allow-same-origin`) |
| Iframe → parent | Canvas posts only to `window.parent` with typed envelope; ignore unexpected targets |
| Schema | Every message validated against a Zod (or equivalent) envelope: `{ type, version, payload }` — unknown `type` dropped |
| Replay / spoof | No privileged actions (save, publish, capability elevation) via bridge; bridge is measurement / selection / DnD / error-report only |
| Version | Envelope `version` required; mismatched versions rejected |

### 22.6 Server-side re-validation

Client composers are UX, not authority. On `onSave` / `onPublish` the **host** must:

- Re-parse `customCss` / `globalCss` with the same reject rules  
- Re-validate `customJs` / `globalJs` **shape** + `enabled` / `runAt`  
- Reject payloads that fail even if the editor UI allowed typing  

### 22.7 Rich-text / props XSS

| Field class | Contract |
| --- | --- |
| Plain text | Escape on render; no HTML interpretation |
| Rich text | Must pass `sanitizeRichText` — allow-list subset (e.g. `p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `a[href]` with safe protocols `http`/`https`/`mailto` only). Strip `script`, event handlers, `style` attributes, `iframe`, `object`, `form` |
| URLs in props | Allow-list schemes; block `javascript:` |

### 22.8 Capability / role gate (who may author risk)

Host injects `capabilities` (ADR-05). Engine UI hides Advanced CSS/JS and registration entry points when false; **host must re-check on save**.

| Capability | Gates |
| --- | --- |
| `allowCustomCss` | Advanced CSS + Global CSS fields |
| `allowCustomJs` | Advanced JS + Global JS (stricter; default off for low-trust tenants) |
| `allowRegisterPluginBlocks` | §24 Model A plugin registration in that workspace |
| `allowDynamicBlockDefs` | §24 Model B JSON definitions |
| `allowDataBinding` | Attaching a `dataBinding` (repeater + DataSource) to any block in that workspace; without it, the `repeater` primitive and DataSource picker are hidden from the palette/inspector, and any `dataBinding` present on load is treated as inert (renders `itemTemplate` once with no data, no live fetch) rather than crashing |

Ties to §24 registration and §25 data binding — unsigned / unprivileged tenants cannot introduce new executable render paths, and untrusted tenants cannot query arbitrary host DataSources without this capability, even if a `dataBinding` object is present in page JSON (e.g. copied from another page).

---

## 23. Block / Component Visibility & Conditional Rendering

**Decision:** Visibility is a **render-time predicate**, never a silent tree delete. Author intent (`visibility`) and runtime conditions (`visibleWhen`) are evaluated by `visibilityResolve` inside the shared `RenderPage`, identically for canvas (with ghost affordance), preview, and Open Page (omit from DOM).

**Why:** Authors need hide-on-mobile / hide-per-locale / feature-flag / schedule behavior without forking pages or losing nested content. CIB-style stubs without a contract produce canvas/publish drift.

### 23.1 Two layers

| Layer | Field | Meaning |
| --- | --- | --- |
| **Author / device / locale intent** | `Block.visibility` | Structured flags: canvas-only hide, publish hide, devices, locales (§3) |
| **Runtime condition** | `Block.visibleWhen` | Predicates evaluated against host `renderContext` |

Both must pass for a block to render as normal page content.

### 23.2 `renderContext` (host-injected)

```text
renderContext: {
  locale: string;
  device: 'desktop' | 'tablet' | 'mobile';
  auth?: { isLoggedIn: boolean; roles?: string[] };
  flags?: Record<string, boolean | string>;
  query?: Record<string, string>;
  dateNow?: string;            # ISO — injectable for tests
  ab?: { variant: string };
}
```

**Engine only evaluates** predicates against this object. Engine never fetches auth/session itself (ADR-05).

#### 23.2.1 Item-scoped evaluation inside repeaters

**Decision:** When a block with `visibleWhen` lives inside a repeater's `itemTemplate` (§25), `visibilityResolve` evaluates predicates against a **merged** context: `{ ...renderContext, item: <current bound item> }` — scoped only to that one expansion pass, never leaking `item` outside the repeater's subtree.

Predicate examples (in addition to host keys on `renderContext`):

```text
# { key: 'auth.isLoggedIn', equals: true }
# { key: 'flags.promo', equals: true }
# { key: 'date.now', between: [startIso, endIso] }
# { key: 'ab.variant', equals: 'B' }
# { key: 'item.cta', notEquals: '' }   # hide button if this post has no CTA link
```

Outside a repeater's `itemTemplate`, `item.*` keys are **undefined** and any predicate referencing them evaluates to **false** (fails safe — hidden, not shown, not a crash).

### 23.3 Surface behavior

| Surface | When predicate fails |
| --- | --- |
| **Canvas** | Block not painted as page content; parent overlay shows **dimmed / ghost** outline (“hidden by condition”) so authors can still select it |
| **Preview** | Omitted from DOM (same as Open Page) unless a debug query opts into ghost mode |
| **Open Page** | Omitted from DOM |

### 23.4 Outline Tree interaction (§10.4)

- Hidden blocks **remain in the tree and the outline**, shown dimmed  
- Toggling visibility never removes `children` or props  
- Delete is an explicit tree mutation — distinct from hide  

### 23.5 Evaluation order (centralized)

```text
visibilityResolve(block, renderContext, surface):
  # renderContext may include `item` when dataBinding.ts calls this during
  # repeater expansion (§23.2.1). This function only reads the object given —
  # it does not construct or distinguish merged vs host-only contexts.
  1. if visibility.hiddenOnPublish && surface !== 'canvas' → hide
  2. if visibility.hiddenOnCanvas && surface === 'canvas' → ghost
  3. if device in hiddenDevices → hide/ghost by surface rules
  4. if locale in hiddenLocales → hide/ghost by surface rules
  5. if visibleWhen fails → hide/ghost by surface rules
  6. else show
```

Document once in `visibilityResolve.ts` — blocks must not special-case.

---

## 24. User-Registered Custom Blocks (Plugin / Tenant Registration)

**Decision:** Tenants and plugins may add block types **without forking the engine**, via a live registry, under two named strategies. Executable `render` code is never `eval`’d from the network.

**Why:** Product flexibility (white-label, marketplace) requires extension. Uncontrolled remote code execution destroys the §22 security model.

### 24.1 Model A — Client-bundled custom block (build-time / bundle registration)

**Decision:** Host app imports a block module and calls `registerBlock(definition)` **before** mounting `<PageBuilder>`.

| Field | Requirement |
| --- | --- |
| `type` | **Namespaced**: `tenant:…` or `plugin:vendor.block` — never collide with core primitives (`heading`, `box`, …) |
| `render` | React component shipped in the host/plugin **bundle** |
| `ContentFields` | Inspector UI in the same bundle |
| `propsSchema` | Zod (mandatory) |
| `translatableProps` / `sharedProps` | Same i18n rules as core (§19) |
| `source` | `'tenant' \| 'plugin'` |
| `capabilities?` | Optional finer gates |

**This is the only v1-safe path for custom `render` logic.**

### 24.2 Model B — Server-defined dynamic block (data-driven, no new render code)

**Decision:** Tenant defines a JSON spec fetched via `fetchDynamicBlocks` (ADR-05): `propsSchema` + a **composition tree of EXISTING primitives** (+ optional data binding — §25). Adapted into a `BlockDefinition` whose `render` / fields are **engine-generated field-driven adapters**, not downloaded JS.

| Allowed | Forbidden |
| --- | --- |
| JSON field specs + primitive template trees | Fetching arbitrary JS and `eval` / `new Function` as `render` |
| Register into live registry → `.refine()` accepts instances | “Trusted partner” exception that skips sandbox |

**Field adapter contract:** The mapping from a Model B JSON field spec (`{ key, kind: 'text' | 'richText' | 'image' | 'select' | 'boolean' | 'number' | 'url', options?, translatable? }`) to the actual `ContentFields` inspector control is engine-generated, not ad hoc per adapter. This mapping is a single authoritative contract, documented in `docs/page-builder/api/field-types.md` (already listed in §18.1) — any new `kind` requires a doc update in the same PR (per §18.2's "no silent drift" rule). Model B `propsSchema` field `kind` values must be drawn from this same enum; unknown `kind` at registration time is a `blockRegistrationGuard` error, not a silent fallback to plain text.

**Hard security rule:** remote code execution via dynamic eval of block render is forbidden — not a preference.

### 24.3 Signed dynamic import (Phase 19)

**Shipped, opt-in (default deny).** Hosts that need per-customer executable `render` without rebuilding:

- Host-controlled URL only (`allowedImportOrigins`)
- Subresource integrity check on fetched bytes before load
- `import()` of a vetted ESM blob — **never** inline eval
- Capability `allowSignedBlockImport: true` required
- Same iframe isolation for author scripts (ADR-02 / §22)

API: `registerSignedBlock` in `@itzsa/page-builder`. See `docs/page-builder/guides/phase-19-signed-import.md`.

### 24.4 Registration lifecycle

| Event | Behavior |
| --- | --- |
| `registerBlock` duplicate `type` | **Loud error** — do not silent-override |
| Namespace violation | Reject in `blockRegistrationGuard` |
| Tenant removes plugin | Existing pages with that `type` must **not crash** |
| Unknown `type` at render | `fallbackBlock` renderer: tree-preserving placeholder (“Unavailable block: type”), same parity on canvas/preview/Open Page |
| Version bump of definition | Instance data migrates via `schemaVersion` / per-type migrations if needed; otherwise fallback until migrated |

### 24.5 Docs

- `docs/page-builder/guides/register-custom-block.md` (Model A)  
- `docs/page-builder/guides/dynamic-block-data-binding.md` (Model B)
- `docs/page-builder/guides/phase-19-signed-import.md` (signed `import()`)

---

## 25. Dynamic Data-Bound Blocks (Elementor-style Blog Card / CMS loops)

**Decision:** CMS loops are a **repeater primitive + DataSource + binding tokens** over a **primitive template tree** — not a monolithic `blog-card` widget. Preserves ADR-07.

**Why:** Elementor’s Posts widget is valuable; CIB’s locked `blog-card` is not remixable. Binding must compose with §9 cards and §19 locales without a second render pipeline.

### 25.1 Concepts

| Concept | Role |
| --- | --- |
| **DataSource** | Host-registered query id + `itemSchema` (§3) |
| **`repeater` block** | Container with `dataBinding: { sourceId, params, itemTemplate }` |
| **Binding token** | String placeholder in props / i18nProps, e.g. `{{item.title}}`, `{{item.image}}` |
| **Expand** | `RenderPage` / `dataBinding.ts` clones `itemTemplate` once per returned item, resolves tokens, assigns fresh instance ids for the expanded view (source template ids remain stable in the stored page tree). **Per item**, expansion builds the merged context `{ ...renderContext, item }` once and passes it to `visibilityResolve` for every node in that clone before injecting into `RenderPage` output (§23.2.1). |

### 25.2 Authoring UX

- Inspector: DataSource picker, query params (limit, filter, sort — from source metadata, not hardcoded), **sample data toggle** so the template remains editable with zero live items  
- Outline: shows `repeater` + template children (not N expanded clones as persistent tree nodes)  
- Canvas: expands with sample or live data for WYSIWYG; expansion is render-time  

### 25.3 Fetch strategies (PreviewPort-like dual support)

| Strategy | When | Who fetches |
| --- | --- | --- |
| **A — Host-resolved (SSR / RSC)** | Open Page | Host calls API, passes resolved items into `renderContext` / props bag; engine only expands |
| **B — Client callback** | Canvas / SPA Open Page | Engine calls `fetchDataSource(sourceId, params)` (ADR-05); never imports `services/` |

Both must support **loading**, **empty**, and **error** UI states — identical semantics across canvas / preview / Open Page (styling still author CSS; engine provides structural state attributes only, e.g. `data-binding-state="empty"`).

**Cross-strategy parity:** Strategies A (host-resolved/SSR) and B (client `fetchDataSource`) must expand to the **same DOM** for the same underlying DataSource query and params — same item order, same token resolution, same empty/loading/error state markup. This is a parity requirement on top of the existing canvas/preview/Open Page parity rule (§4), not a separate concern: if a host uses Strategy A for Open Page and Strategy B for canvas (a common split — SSR on publish, client fetch while editing), the two must still be verified against one fixture DataSource + mocked item set.

### 25.4 Token security & parser grammar

**Decision:** Binding tokens are resolved by a single deterministic parser in `dataBinding.ts` — not ad hoc `String.replace` scattered in blocks.

#### Grammar

```text
token       := '{{' ws? path ws? '}}'
path        := 'item' ( '.' ident )+
ident       := [A-Za-z_][A-Za-z0-9_]*
ws          := optional whitespace
```

Only paths starting with `item.` are valid inside an expansion. No filters, no nested `{{`, no expressions.

#### Resolution algorithm

```text
1. Scan the string left-to-right for '{{'
2. If not followed by a valid token (grammar above) ending in '}}':
   - Treat '{{' as LITERAL text (emit '{{' and continue) — supports author
     content that intentionally contains {{ without being a binding
3. If valid token:
   a. Lookup path on current item (and typed itemSchema when available)
   b. Missing / undefined / unknown path → emit '' (empty string); do not
      leave raw '{{item.x}}' in output
   c. Value coerced to string for text fields; URLs validated per §22.7
   d. HTML-capable fields still pass sanitizeRichText AFTER substitution
4. Malformed near-tokens (e.g. '{{item.}}', '{{item.0name}}', unclosed '{{item.title')
   → treat as literal from '{{' onward until next safe boundary (same as step 2)
5. Nested / recursive tokens in resolved values are NOT re-scanned
   (one pass only — prevents injection of new tokens via CMS data)
```

#### Security

- Resolve tokens to **strings / URLs** typed by `itemSchema`  
- HTML fields from items still pass `sanitizeRichText`  
- Unknown tokens → empty string (documented), never raw `{{…}}` leak into XSS sinks  
- CMS data cannot introduce new `{{…}}` bindings via step 5  

### 25.5 Example — “Blog cards” the right way

```text
repeater  (dataBinding → sourceId: "posts", params: { limit: 6 })
└── itemTemplate:
    box
    ├── image     src: {{item.image}}
    ├── heading   text: {{item.title}}
    ├── text      body: {{item.excerpt}}
    └── button    label: {{item.cta}}  href: {{item.url}}
```

Same primitives as §9 Card preset; only the repeater/binding layer is new.

### 25.6 Docs

- `docs/page-builder/concepts/data-binding.md`  
- `docs/page-builder/guides/dynamic-blog-card.md`

---

## 26. Glossary

| Term | Meaning |
| --- | --- |
| Primitive | Low-level block (box, heading, text, image, …) meant for composition |
| Preset | Palette recipe that inserts a nested tree of primitives |
| OutlineTree | Hierarchical layers UI for the page block tree |
| Author CSS | User-written per-block / global CSS — source of page look |
| Bridge | Typed postMessage between parent editor and canvas iframe |
| RenderPage | Shared React walker for canvas, preview, and Open Page |
| Parity | Canvas / preview / Open Page visual contract for the same document |
| Locale | Content language code (`en`, `ne`, …) configured by host |
| i18nProps | Per-locale translatable field map on a Block |
| PreviewPort | Host strategy for large-page preview without URL payloads |
| Topic doc | One docs page per capability (Puck-style) |
| **DataSource** | Host-registered query descriptor + item schema for dynamic lists |
| **Repeater / Loop block** | Container that expands an `itemTemplate` once per data item |
| **Binding token** | `{{item.field}}` placeholder resolved from DataSource items |
| **Namespaced block type** | `tenant:…` / `plugin:…` id preventing collisions with core primitives |
| **Fallback block renderer** | Safe placeholder when `Block.type` is unregistered — tree-preserving, non-crashing |
| **renderContext** | Host-injected locale/device/auth/flags object for visibility predicates |
| **visibleWhen** | Runtime conditional predicate on a Block |
| **Model A / Model B** | Bundled custom `render` vs data-driven dynamic definition (§24) |
| **Item-scoped context** | `{ ...renderContext, item }` used only while expanding a repeater `itemTemplate` (§23.2.1) |
| **CSP nonce** | Per-render cryptographic nonce for composer `<script>`/`<style>` — replaces `'unsafe-inline'` (§22.2) |
| **Field adapter** | Model B `kind` → inspector control mapping via `fieldAdapterResolve` (§24.2) |
| **allowDataBinding** | Host capability gating repeater / DataSource activation (§22.8) |
| **Web accessibility** | WCAG 2.2 AA + Web Interface Guidelines required for blocks and editor chrome (ADR-13) |
| **Page JSON** | Canonical persisted document (`Page` schema) — default on save/publish (ADR-14) |
| **HTML snapshot** | Optional derived full HTML/CSS/JS export; never authoritative for re-edit (ADR-14) |
| **Flat locale keys** | Host form e.g. `desc_en` / `desc_ne` / `desp_eng` / `desp_np` — normalized to/from `i18nProps` (ADR-10) |
| **Container background image** | First-class `backgroundImage` (and related) on `box`/`container`/`flex`/`grid` — §9.1 |
| **V1 band** | Phases 1–11 only (ADR-15) |
| **Page.revision** | Opaque concurrency token; paired with `expectedRevision` on save (ADR-16) |
| **Binding token** | Exactly `{{item.ident(.ident)*}}`; one-pass resolver (§25.4) |

---

*End of architecture standard. Implementation must follow this document; amend the document explicitly when the design changes.*
