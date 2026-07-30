# @itzsa/a11y-toolbar

Floating accessibility preference toolbar for React — text size, contrast,
spacing, motion, and reading aids. React/npm API, SSR FOUC split, keyboard
shortcuts, and WCAG-grounded control behavior.

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

## Quick start (React)

1. **SSR a content wrapper** so FOUC prevention works:

```tsx
<main data-a11y-content>{children}</main>
```

2. **Inline FOUC script** in `<head>`:

```tsx
<script
  dangerouslySetInnerHTML={{ __html: getA11yFoucScript("itzsa-a11y") }}
/>
```

3. **Mount the toolbar** once (outside the content wrapper):

```tsx
<A11yToolbar />
```

### Next.js (App Router)

```tsx
// app/layout.tsx (Server Component)
import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";

export default function RootLayout({ children }) {
  const a11yFouc = getA11yFoucScript();
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: a11yFouc }} />
      </head>
      <body>
        <main data-a11y-content>{children}</main>
        <A11yToolbarClient />
      </body>
    </html>
  );
}
```

```tsx
// components/A11yToolbarClient.tsx
"use client";
import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";
import "@itzsa/a11y-toolbar/styles.css";

export function A11yToolbarClient() {
  return (
    <A11yToolbar
      position="bottom-center"
      panelAlign="left"
      locales={{ ne: NE_MESSAGES }}
    />
  );
}
```

### Vite + React

```tsx
// main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";
import { getA11yFoucScript } from "@itzsa/a11y-toolbar/headless";
import "@itzsa/a11y-toolbar/styles.css";
import App from "./App";

// FOUC bootstrap before paint
const s = document.createElement("script");
s.textContent = getA11yFoucScript();
document.head.appendChild(s);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div data-a11y-content>
      <App />
    </div>
    <A11yToolbar
      position="bottom-right"
      locales={{ ne: NE_MESSAGES }}
      // Optional: custom shortcuts (see below)
    />
  </StrictMode>,
);
```

```html
<!-- index.html — mark a content root early if you prefer -->
<body>
  <div id="root"></div>
</body>
```

## Keyboard shortcuts

Shortcuts are registry-driven and scalable — add bindings without forking the UI.

| Shortcut | Action |
| --- | --- |
| `Alt+A` | Toggle panel |
| `Alt+Shift+R` | Reset all preferences |
| `Alt+Shift++` / `=` | Increase text size |
| `Alt+Shift+-` | Decrease text size |
| `Alt+Shift+C` | Cycle contrast |
| `Alt+Shift+M` | Toggle pause animations |
| `Alt+Shift+G` | Toggle reading guide |
| `Alt+Shift+L` | Toggle highlight links |
| `Alt+Shift+D` | Toggle reading spacing aid |

Ignored while focus is in `input` / `textarea` / `select` / `contenteditable`.
Feature shortcuts respect `features={{ …: false }}` (disabled features are skipped).

```tsx
import {
  A11yToolbar,
  DEFAULT_A11Y_SHORTCUTS,
  mergeA11yShortcuts,
} from "@itzsa/a11y-toolbar";

// Remap panel toggle + keep feature defaults
<A11yToolbar hotkey={{ altKey: true, shiftKey: true, key: "a" }} />

// Disable feature shortcuts; keep panel hotkey only
<A11yToolbar shortcuts={false} hotkey={{ altKey: true, key: "a" }} />

// Full custom map (scalable)
<A11yToolbar
  shortcuts={mergeA11yShortcuts(DEFAULT_A11Y_SHORTCUTS, [
    { id: "reset", keys: null }, // remove reset shortcut
    {
      id: "textSizeInc",
      keys: { altKey: true, key: "]" },
      action: { type: "feature", feature: "textSize", mode: "inc" },
      label: "Increase text size",
    },
  ])}
/>
```

## WordPress / CDN (minified drop-in)

A minified IIFE bundles React so classic WordPress and static HTML sites
only need two files:

- `dist/a11y-toolbar.min.js` → global `ItzsaA11yToolbar`
- `dist/a11y-toolbar.min.css`

### CDN URLs (docs site)

```
https://itzsa.acharya-suman.com.np/cdn/a11y-toolbar/a11y-toolbar.min.css
https://itzsa.acharya-suman.com.np/cdn/a11y-toolbar/a11y-toolbar.min.js
```

After publish, jsDelivr:

```
https://cdn.jsdelivr.net/npm/@itzsa/a11y-toolbar@VERSION/dist/a11y-toolbar.min.css
https://cdn.jsdelivr.net/npm/@itzsa/a11y-toolbar@VERSION/dist/a11y-toolbar.min.js
```

### Plain HTML

```html
<!doctype html>
<html lang="en">
  <head>
    <link
      rel="stylesheet"
      href="https://itzsa.acharya-suman.com.np/cdn/a11y-toolbar/a11y-toolbar.min.css"
    />
  </head>
  <body>
    <main data-a11y-content><!-- your site --></main>
    <script src="https://itzsa.acharya-suman.com.np/cdn/a11y-toolbar/a11y-toolbar.min.js"></script>
    <script>
      ItzsaA11yToolbar.mount({
        position: "bottom-center",
        contentRoot: "main",
      });
    </script>
  </body>
</html>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `storageKey` | `string` | `"itzsa-a11y"` | localStorage key |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open |
| `open` / `onOpenChange` | controlled | — | Control panel visibility |
| `features` | `Partial<Record<FeatureId, boolean>>` | all on | Set `false` to hide a control |
| `hotkey` | `{ altKey?, key, ... } \| null` | `Alt+A` | Panel toggle; syncs into shortcut map |
| `shortcuts` | `A11yShortcutDef[] \| false` | defaults | Full shortcut registry; `false` = panel only |
| `onChange` | `(prefs) => void` | — | Fired after preference updates |
| `launcherLabel` | `string` | locale message | Override launcher accessible name |
| `position` | `A11yToolbarPosition` | `"bottom-right"` | Launcher placement |
| `panelAlign` | `"auto" \| "left" \| "right" \| "center"` | `"auto"` | Panel horizontal edge |
| `theme` | `A11yToolbarTheme` | itzsa green | Chrome + effect tokens (`accent`, `background`, `cursor`, …) → `--itzsa-a11y-*` |
| `style` | `CSSProperties` | — | Same CSS variables via `CSS_VAR` or host `:root` overrides |
| `locale` / `defaultLocale` / `onLocaleChange` | i18n | — | Controlled or uncontrolled locale |
| `locales` / `messages` | dictionaries | — | Extra / override copy |

### Theme / custom styles

Every chrome token maps to a namespaced CSS variable. Prefer the `theme` prop, or set vars on `:root`:

```tsx
import { A11yToolbar, CSS_VAR } from "@itzsa/a11y-toolbar";

<A11yToolbar
  theme={{
    accent: "var(--accent)",
    background: "#e8eaef",
    cursor: 'url("/cursors/big.svg") 2 2',
  }}
  style={{ [CSS_VAR.toolbarRadius]: "12px" }}
/>
```

`theme.cursor` / `theme.guideHeight` are synced onto `<html>` so page-wide effects (bigger cursor, reading guide height) pick them up immediately.

## Internationalization

```tsx
import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";

const locale = useAppLocale();
const setLocale = useSetAppLocale();

<A11yToolbar
  locale={locale}
  onLocaleChange={setLocale}
  locales={{ ne: NE_MESSAGES }}
  messages={{ panelTitle: "Site accessibility" }}
/>
```

## Architecture notes

- Preferences persist as `{ schemaVersion, values }` (legacy blobs auto-migrate)
- Attrs + `--itzsa-a11y-*` CSS variables → `<html>`
- Effects → `[data-a11y-content]` only (toolbar uses `data-a11y-toolbar`)
- Feature metadata lives in `A11Y_FEATURE_REGISTRY`
- Shortcuts live in `DEFAULT_A11Y_SHORTCUTS` / `mergeA11yShortcuts`
- **Read Aloud** (`readAloud` + `speechRate`): click-to-speak under the content
  root via Web Speech API; panel exposes pause/resume/stop and a 0.5–2 rate
  slider. Listener is scoped to `[data-a11y-content]` only.

## Headless helpers

```ts
import {
  applyA11yPreferences,
  getStoredPreferences,
  clearStoredPreferences,
  getA11yFoucScript,
} from "@itzsa/a11y-toolbar/headless";
```

Import FOUC / apply helpers from **`@itzsa/a11y-toolbar/headless`** in Server Components.

## License

MIT
