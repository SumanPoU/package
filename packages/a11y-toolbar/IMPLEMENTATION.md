# @itzsa/a11y-toolbar — Implementation notes

What shipped, how it works, and why certain choices were made.
This is the engineering record; see `README.md` for install/API.

## Goal

A reusable React accessibility **preference toolbar** (UserWay / EqualWeb–class
UX, open-source, no overlay SaaS). Visitors adjust presentation; the host site
must still ship semantic HTML and baseline WCAG.

## Package layout

```
packages/a11y-toolbar/
  src/
    types.ts            Preferences + feature IDs + constants
    registry.ts         Feature registry (sections, kinds, step counts)
    defaults.ts         Default prefs, labels (STEP_COUNT from registry)
    storage.ts          localStorage get/set/clear + normalize
    preferences.ts      cycleStep / toggle / reset / equality
    apply.ts            Write data-* + CSS vars onto <html>
    fouc-script.ts      Inline <head> bootstrap (no React)
    headless.ts         Server-safe export surface
    index.ts            Client entry (A11yToolbar + re-exports)
    A11yToolbar.tsx     Launcher + dialog + cards + hotkey
    ToolCard.tsx        Stepped / toggle card
    ReadingGuide.tsx    Pointer-following reading band
    hooks.ts            Focus trap + hotkey
    icons.tsx           Inline SVGs (ISA launcher mark)
    styles.css          Chrome UI + content effect rules
  scripts/prepend-use-client.mjs
  test/preferences.test.ts
  README.md
  IMPLEMENTATION.md     ← this file
```

## Architecture

```
┌──────────────────┐     localStorage      ┌─────────────────────┐
│  A11yToolbar UI  │ ───────────────────►  │  itzsa-a11y (JSON)  │
└────────┬─────────┘                       └──────────▲──────────┘
         │ applyA11yPreferences()                     │
         ▼                                            │
┌──────────────────┐     FOUC inline script ──────────┘
│  <html data-*>   │◄── getA11yFoucScript() in <head>
│  + CSS variables │
└────────┬─────────┘
         │ styles.css selectors
         ▼
┌──────────────────┐
│ [data-a11y-content]  ← must be SSR’d in layout
└──────────────────┘
│ [data-a11y-toolbar]  ← launcher/panel (excluded from effects)
```

### Two entry points (Next.js RSC)

| Import | Safe in RSC? | Contains |
|--------|--------------|----------|
| `@itzsa/a11y-toolbar` | No (`"use client"`) | `A11yToolbar` + helpers |
| `@itzsa/a11y-toolbar/headless` | Yes | FOUC, apply, storage, types |
| `@itzsa/a11y-toolbar/styles.css` | Yes | Effects + chrome |

Root layout must **not** import the client entry for FOUC — that caused the
`useRef` / Server Component error. Use `/headless` only.

## Features implemented (v1)

### Stepped (cycle 0 → n-1 → 0)

| Feature | Levels | How it applies |
|---------|--------|----------------|
| Text Size | 4 | `zoom` on `[data-a11y-content]` (1 / 1.125 / 1.25 / 1.45). Scales rem **and** Tailwind `text-[Npx]` utilities. Fallback `transform: scale` when `zoom` unsupported. |
| High Contrast | 3 | Soft slate theme / forced black–white on content descendants |
| Text Align | 3 | left (default) / center / right on block text elements |
| Color Filter | 4 | off / grayscale / hue-rotate / sepia-ish via CSS `filter` |
| Text Spacing | 3 | letter + word spacing `!important` on text nodes |
| Line Height | 3 | line-height `!important` on text nodes |
| Font Selection | 3 | default / system-ui / Georgia serif |
| Saturation | 3 | `filter: saturate(...)` composited with color filter |

### Toggles

| Feature | Behavior |
|---------|----------|
| Dyslexia Friendly | Spacing-only (letter/word/line). **No** bundled OpenDyslexic font (license simplicity). |
| Bigger Cursor | 32×32 SVG data-URI cursor (Safari-safe size band), hotspot (2,2). Toolbar keeps `pointer`. |
| Hide Images | Hides `img` / `picture` / `video` / `[role=img]` only — **not** UI SVGs. |
| Pause Animations | Forces `animation/transition: none`. **Additive** with `prefers-reduced-motion` (`paused = toggle \|\| OS`). |

## Why early versions “didn’t work”

1. **Text size** set `font-size` on the content wrapper only. Tailwind utilities set
   explicit sizes on children (`text-sm`, `text-[15px]`), so nothing visibly grew.
   → Fixed with **`zoom` on `[data-a11y-content]`**.
2. **Spacing / line-height / font** needed descendant + `!important` to beat utilities.
3. **Bigger cursor** was a stub (`crosshair`). → Real SVG cursor URL.
4. **Hide images** hid all `svg`, nuking icons. → Media/role only.
5. **RSC import** of the client bundle broke the docs layout. → `/headless` split.

## Docs site integration

File: `src/app/layout.tsx`

1. Import `@itzsa/a11y-toolbar/styles.css` (effects available before hydration).
2. Inline `getA11yFoucScript()` from `/headless` in `<head>`.
3. Wrap page body content: `<div data-a11y-content>…</div>` (**SSR**, not client-only).
4. Mount `<SiteA11yToolbar />` **outside** that wrapper.

Live docs: `/a11y-toolbar`.

## Accessibility of the toolbar itself

- Dialog: `role="dialog"`, `aria-modal`, labelled title, Esc closes, focus trap,
  restore focus to launcher.
- Cards: real `<button>`s; toggles use `aria-pressed`; steps announce level.
- Live region (`aria-live="polite"`) announces changes.
- Hotkey default **Alt+A** (ignored in inputs). Configurable / `null` to disable.
- **Acceptance criterion (open):** verify Alt+A with **NVDA** before locking the
  default for a public release (documented in README).

## Motion model

```
effectivePause = preferences.pauseAnimations || prefers-reduced-motion: reduce
```

The toggle must never re-enable motion when the OS preference is `reduce`.

## Bigger cursor — Phase 2 spike criteria (written before spike)

| Browser | Pass |
|---------|------|
| Chrome latest | 32×32 custom cursor renders over content |
| Firefox latest | Same |
| Safari latest | Same **or** measured hard size limit documented |

Ship `url()` cursor only if pass; otherwise keep keyword fallback.
Current v1 ships 32×32 SVG (within typical Safari limits).

## Build / publish

- Dual tsup entries: `index` (client banner prepended post-build) + `headless`
- Version `0.0.0` until explicit publish approval
- Tests: normalize / cycle / toggle / FOUC key embed
- Workspace wired in root `build:packages` / `typecheck:packages` / `test:packages`

## Explicit non-goals (v1)

- WCAG certification of host pages
- Bundled dyslexia typeface
- Profiles / cloud sync / analytics
- Vue / Svelte ports
- Medical-grade color-vision simulation

See also [`BEHAVIOR.md`](./BEHAVIOR.md) for the WCAG/ARIA per-control contract.
