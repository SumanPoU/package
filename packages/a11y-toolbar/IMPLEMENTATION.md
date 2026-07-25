# @itzsa/a11y-toolbar — Implementation notes

Engineering record for the preference toolbar. Behavior values live in
`BEHAVIOR.md`. Monorepo conventions: repo-root `STANDARDS.md`.

## Architecture

```
┌──────────────────┐   versioned JSON    ┌─────────────────────┐
│  A11yToolbar UI  │ ──────────────────► │  localStorage key   │
│  (registry map)  │   schemaVersion:1   │  { schemaVersion,   │
└────────┬─────────┘                     │    values }         │
         │ scheduleApply (~50ms)         └──────────┬──────────┘
         ▼                                          │ FOUC script
┌──────────────────┐                                ▼
│ apply + registry │  data-* + --itzsa-a11y-*  ┌────────────┐
│   (headless OK)  │ ────────────────────────► │   <html>   │
└──────────────────┘                           └─────┬──────┘
                                                     │ CSS
                                                     ▼
                                           [data-a11y-content]
```

## Scalability model

`A11Y_FEATURE_REGISTRY` (`registry.ts`) is the single source of truth:

- `labels` (title + description), `kind`, `section`, `levels`, `iconId`
- `apply(root, value)` — attribute writes only
- `ariaAnnounce(value)` — live-region copy
- `cssVars` — owned custom properties (documentation / cleanup)

`A11yToolbar` / `ToolCard` **map** the registry — no per-feature JSX branches.
Icons resolve via `iconId` → `icons.tsx` (React stays out of `registry.ts` so
`./headless` stays React-free).

Adding feature N+1: edit `registry.ts` + add an icon map entry.

## Storage versioning

`StoredPreferences = { schemaVersion, values }`.

`migrate()`:

1. Legacy unversioned blob → wrap as `schemaVersion: 1`
2. Versioned doc → normalize `values` (seam ready for `v1 → v2`)
3. Corrupt input → defaults (never throws)

## Debounced apply

- React state updates are **synchronous** (correct `aria-pressed` / UI).
- DOM writes go through `scheduleApplyA11yPreferences` (~50ms trailing).
- Reset / unmount uses `flushApplyA11yPreferences`.

## CSS namespace

All custom properties use `--itzsa-a11y-*` (see `css-vars.ts` + `STANDARDS.md`).

## Package layout

```
packages/a11y-toolbar/
  src/
    registry.ts         Feature definitions (no React)
    apply.ts            Orchestrate apply + debounce
    storage.ts          migrate / get / set
    css-vars.ts         Namespaced property constants
    A11yToolbar.tsx     Launcher + dialog (maps registry)
    ToolCard.tsx        Generic card
    icons.tsx           Outline icon set + Aa launcher
    ErrorBoundary.tsx   Panel-body isolation
    styles.css          Chrome + content effects
    headless.ts         Server-safe exports
    index.ts            Client entry
  test/
  BEHAVIOR.md
  IMPLEMENTATION.md
  README.md
```

## Motion model

`paused = pauseAnimations toggle || prefers-reduced-motion`.
Toolbar chrome transitions also honor both — the control does not exempt itself.
