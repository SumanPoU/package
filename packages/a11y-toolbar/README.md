# @itzsa/a11y-toolbar

Inspired by open widgets such as [Sienna](https://github.com/bennyluk/Sienna-Accessibility-Widget),
[Astral](https://github.com/verto-health/astral-accessibility), and
[accessibility-widgets](https://github.com/sinanisler/accessibility-widgets) —
with a React/npm API, SSR FOUC split, and WCAG-grounded control behavior.

> **Note for integrators.** This package helps visitors customize presentation.
> It does **not** make an inaccessible site WCAG-compliant. Semantic HTML,
> keyboard support, and contrast in your base UI remain required.

## Install

```bash
pnpm add @itzsa/a11y-toolbar
```

```ts
import { A11yToolbar } from "@itzsa/a11y-toolbar";
import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";
import "@itzsa/a11y-toolbar/styles.css";
```

## Quick start

1. **SSR a content wrapper** so FOUC prevention works (attrs on `<html>`,
   effects under `[data-a11y-content]`):

```tsx
<main data-a11y-content>{children}</main>
```

2. **Inline FOUC script** in `<head>` (same pattern as theme bootstrap):

```tsx
<script
  dangerouslySetInnerHTML={{ __html: getA11yFoucScript("itzsa-a11y") }}
/>
```

3. **Mount the toolbar** once (outside the content wrapper):

```tsx
<A11yToolbar />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `storageKey` | `string` | `"itzsa-a11y"` | localStorage key |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open |
| `open` / `onOpenChange` | controlled | — | Control panel visibility |
| `features` | `Partial<Record<FeatureId, boolean>>` | all on | Set `false` to hide a control |
| `hotkey` | `{ altKey?, key, ... } \| null` | `Alt+A` | Pass `null` to disable |
| `onChange` | `(prefs) => void` | — | Fired after preference updates |
| `launcherLabel` | `string` | `"Accessibility tools"` | Launcher accessible name |

## Features (v1)

**Stepped:** Text Size, High Contrast, Text Align, Color Filter, Text Spacing,
Line Height, Font Selection, Saturation.

**Toggles:** Dyslexia Friendly (spacing-only — no bundled font), Bigger Cursor
(32×32 SVG cursor), Hide Images (media only), Pause Animations.

**Text size** uses `zoom` on `[data-a11y-content]` so Tailwind `text-*` / `px`
utilities scale (parent `font-size` alone is not enough).

**Motion model:** `paused = toggle || prefers-reduced-motion`. The toggle never
re-enables motion when the OS preference is `reduce`.

Engineering detail: see [`IMPLEMENTATION.md`](./IMPLEMENTATION.md) and
[`BEHAVIOR.md`](./BEHAVIOR.md) (per-control WCAG/ARIA spec).

Color Filter / Saturation are **presentation aids**, not clinically validated
color-vision correction tools.

## Hotkey (Alt+A)

Default opens the panel. Ignored while focus is in `input` / `textarea` /
`select` / `contenteditable`. Disable with `hotkey={null}` or remap via prop —
document this in your app if extensions or AT claim the combo.

### Acceptance criterion (must pass before locking Alt+A as shipped default)

- [ ] With **NVDA** (Windows): press Alt+A on a page with the toolbar mounted;
      the panel opens (or focuses) and NVDA does not swallow the key for its own
      command. If NVDA intercepts Alt+A, change the default hotkey (e.g. Alt+Shift+A)
      before release and update this README.

JAWS often remaps Alt+letter shortcuts; treat JAWS conflicts as a known risk and
prefer documenting `hotkey` override rather than blocking ship solely on JAWS.

## Bigger cursor

v1 ships a **32×32 SVG** data-URI cursor (Safari-safe size band). Pass/fail
spike criteria remain in [`IMPLEMENTATION.md`](./IMPLEMENTATION.md).

## Architecture notes

- Attrs + CSS variables → `<html>`
- Effects → `[data-a11y-content]` only (toolbar uses `data-a11y-toolbar`)
- Content wrapper **must** be in SSR HTML for FOUC script to matter

## Headless helpers

```ts
import {
  applyA11yPreferences,
  getStoredPreferences,
  clearStoredPreferences,
  getA11yFoucScript,
} from "@itzsa/a11y-toolbar/headless";
```

Import FOUC / apply helpers from **`@itzsa/a11y-toolbar/headless`** in Server Components (e.g. `layout.tsx`). The root entry is a Client Component module.

## License

MIT
