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
    <main data-a11y-content>
      <!-- your site content -->
    </main>
    <script src="https://itzsa.acharya-suman.com.np/cdn/a11y-toolbar/a11y-toolbar.min.js"></script>
    <script>
      ItzsaA11yToolbar.mount({
        position: "bottom-center",
        panelAlign: "left",
        locales: { ne: ItzsaA11yToolbar.NE_MESSAGES },
        // contentRoot: true, // optional — stamps data-a11y-content on <body>
      });
    </script>
  </body>
</html>
```

### WordPress (`functions.php`)

```php
add_action('wp_enqueue_scripts', function () {
  $base = get_stylesheet_directory_uri() . '/vendor/itzsa-a11y';
  wp_enqueue_style('itzsa-a11y', $base . '/a11y-toolbar.min.css', [], '0.0.0');
  wp_enqueue_script('itzsa-a11y', $base . '/a11y-toolbar.min.js', [], '0.0.0', true);
  wp_add_inline_script('itzsa-a11y', <<<'JS'
ItzsaA11yToolbar.mount({
  position: "bottom-right",
  contentRoot: "main", // or true for document.body
  theme: { header: "#15805f", headerForeground: "#ffffff" }
});
JS, 'after');
});

// FOUC in <head> — enqueue a tiny inline script early:
add_action('wp_head', function () {
  // Prefer printing getA11yFoucScript() output from a build step.
  // Fallback: mark content root only (prefs apply after JS).
}, 1);

add_filter('body_class', function ($classes) {
  // Ensure a content root if you use contentRoot: true in mount()
  return $classes;
});
```

Copy files from `node_modules/@itzsa/a11y-toolbar/dist/` after `pnpm add @itzsa/a11y-toolbar`
(or from a GitHub release / CDN once published).

API on the global:

| Method | Description |
| --- | --- |
| `mount(options?)` | Render the toolbar (options = React props + `target` / `contentRoot`) |
| `unmount()` | Remove the toolbar |
| `getA11yFoucScript(storageKey?)` | Returns the FOUC inline script string |
| `NE_MESSAGES` / `EN_MESSAGES` | Locale dictionaries |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `storageKey` | `string` | `"itzsa-a11y"` | localStorage key |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open |
| `open` / `onOpenChange` | controlled | — | Control panel visibility |
| `features` | `Partial<Record<FeatureId, boolean>>` | all on | Set `false` to hide a control |
| `hotkey` | `{ altKey?, key, ... } \| null` | `Alt+A` | Pass `null` to disable |
| `onChange` | `(prefs) => void` | — | Fired after preference updates |
| `launcherLabel` | `string` | locale message | Override launcher accessible name |
| `position` | `A11yToolbarPosition` | `"bottom-right"` | Launcher placement: `bottom-*` / `top-*` / `middle-*` / `*-center` |
| `panelAlign` | `"auto" \| "left" \| "right" \| "center"` | `"auto"` | Panel horizontal edge; `"auto"` follows the launcher |
| `offset` | `string` | `"1.25rem"` | Gap from viewport edge |
| `launcherSize` | `string` | `"3.5rem"` | Floating button size |
| `panelMaxHeight` | `string` | `min(40rem, 100dvh - 6rem)` | Panel max height (`"32rem"`, `"70dvh"`, …) |
| `panelHeight` | `string` | `auto` | Fixed panel height (still capped by `panelMaxHeight`) |
| `theme` | `A11yToolbarTheme` | itzsa green | Accent, header, launcher colors, font, focus |
| `accentColor` | `string` | — | Deprecated shorthand for accent + header |
| `locale` | `string` | — | Controlled locale (sync with Zustand / Redux / app i18n) |
| `defaultLocale` | `string` | `"en"` | Uncontrolled initial locale |
| `onLocaleChange` | `(locale) => void` | — | Language switch / host sync callback |
| `messages` | `A11yMessagesPartial` | — | Deep-partial overrides on the active locale |
| `locales` | `Record<string, A11yMessagesPartial>` | — | Extra dictionaries (`en` is built-in) |
| `availableLocales` | `string[]` | `en` + keys of `locales` | Codes shown in the language switcher |

## Internationalization

Default language is **English**. Pass extra dictionaries and (optionally) sync
with your app store:

```tsx
import { A11yToolbar, NE_MESSAGES } from "@itzsa/a11y-toolbar";

// Controlled — same source of truth as next-intl / Zustand / Redux
const locale = useAppLocale();
const setLocale = useSetAppLocale();

<A11yToolbar
  locale={locale}
  onLocaleChange={setLocale}
  locales={{ ne: NE_MESSAGES }}
  messages={{ panelTitle: "Site accessibility" }} // optional last-wins overrides
/>
```

**Resolution:** `en` → `locales[active]` → `messages` prop (deep partial).

**Accessibility:** the open panel sets `lang={locale}` (WCAG 3.1.2). Changing
language announces `languageChanged` in the **new** locale via the live region.
Step announcements use **Arabic numerals** (`3 of 4`) in every locale.

**FOUC:** FOUC script sets `data-a11y-locale` on `<html>` from
`${storageKey}:locale`. Translated chrome strings resolve in React — for
SSR-safe copy with no flash, pass controlled `locale` from the host (same
pattern as syncing app i18n state). Uncontrolled mode reads storage on first
client render.

**RTL / `dir`:** not in v1 (Nepali/Hindi are LTR). Deferred if Arabic/Urdu/Hebrew
are added later.

**Dev warning:** incomplete `locales.*` keys that still equal English log a
`console.warn` in non-production builds. Built-in `NE_MESSAGES` is complete.

**Fonts by locale:** English defaults to Outfit; Nepali defaults to Poppins
(with Devanagari fallbacks). Override with props:

```tsx
theme={{
  // Force one stack for every locale:
  // fontFamily: 'var(--font-outfit), Outfit, sans-serif',

  // Or per locale (merged over built-ins):
  fontFamilyByLocale: {
    en: 'var(--font-outfit), "Outfit", system-ui, sans-serif',
    ne: 'var(--font-poppins), "Poppins", "Noto Sans Devanagari", sans-serif',
  },
}}
```

Load the faces in the host app (`next/font`: `--font-outfit`, `--font-poppins`).

## Placement & colors

```tsx
<A11yToolbar
  position="bottom-center" // launcher icon
  panelAlign="left" // panel flush left — or "right" | "center" | "auto"
  offset="1rem"
  launcherSize="3rem"
  locales={{ ne: NE_MESSAGES }}
  theme={{
    accent: "var(--accent)",
    header: "#15805f", // darker than accent — white text clears 4.5:1
    headerForeground: "#ffffff",
    launcher: "#1d9e75",
    launcherForeground: "#ffffff",
    launcherRing: "#ffffff",
  }}
/>
```

`position` controls the **launcher**. `panelAlign` controls the **panel** horizontally
while the vertical edge still tracks `position` (e.g. bottom-center icon + left panel
opens above the bottom edge, flush left).

## Features (v1)

Defined in `A11Y_FEATURE_REGISTRY` — UI renders by mapping the registry.

**Display:** Text Size, Text Spacing, Line Height, Font Selection, Text Align,
Dyslexia Friendly, High Contrast, Color Filter, Saturation, Hide Images,
Highlight Links.

**Motion & assist:** Pause Animations, Bigger Cursor, Reading Guide.

**Text size** uses `zoom` on `[data-a11y-content]` so Tailwind `text-*` / `px`
utilities scale (parent `font-size` alone is not enough).

**Motion model:** `paused = toggle || prefers-reduced-motion`. The toggle never
re-enables motion when the OS preference is `reduce`.

**CSS variables** use the `--itzsa-a11y-*` namespace (see repo `STANDARDS.md`).

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

- Preferences persist as `{ schemaVersion, values }` (legacy blobs auto-migrate)
- Attrs + `--itzsa-a11y-*` CSS variables → `<html>` (DOM writes debounced ~50ms)
- Effects → `[data-a11y-content]` only (toolbar uses `data-a11y-toolbar`)
- Content wrapper **must** be in SSR HTML for FOUC script to matter
- Feature metadata lives in `A11Y_FEATURE_REGISTRY` (React-free; icons via `iconId`)

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
