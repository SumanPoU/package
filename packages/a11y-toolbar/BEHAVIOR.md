# Per-control behavior spec (WCAG / ARIA)

Companion to `IMPLEMENTATION.md`. Defines exact control behavior.
Architecture (storage, FOUC, scoping) is unchanged — this pass is
control-behavior only.

## Shared rules

- Cards are real `<button>`s (WCAG 2.1.1).
- Focus: non-color-only outline ring ≥3:1 (WCAG 2.4.7 / 1.4.11).
- Live region: `aria-live="polite"` — e.g. `Text Size: Large (3 of 4)`.
- Reset → one announcement: `Preferences reset`.
- Toggles: stable accessible name + `aria-pressed` (APG Toggle Button).
- Stepped: no fake `aria-valuenow` on buttons; visible level text + live region.

## Effect values (`effect-values.ts`)

| Preset | Level 0 | 1 | 2 (max) | WCAG note |
|--------|---------|---|----------|-----------|
| Letter-spacing | 0 | 0.06em | **0.12em** | 1.4.12 floor |
| Word-spacing | 0 | 0.08em | **0.16em** | 1.4.12 floor |
| Line-height | 1.5 | 1.75 | **2** | all ≥ 1.5 |
| Text zoom | 1 | 1.125 | 1.25 / **1.45** | with browser zoom ≤ ~200% usable |

**Dyslexia Friendly** sets the same CSS vars to max Text Spacing + Line Height
(`DYSLEXIA_SPACING_LEVEL` / `DYSLEXIA_LINE_HEIGHT_LEVEL`) — one source of truth.

## Text Size zoom feature-detect

`applyA11yPreferences` / FOUC set `data-a11y-zoom-support` from
`CSS.supports('zoom', '1.5')` (not UA sniff).

| Attr | Path |
|------|------|
| `"1"` | native `zoom` |
| `"0"` | `transform: scale` + compensating `width` |

### Manual / Playwright note (Firefox)

1. Open the docs site in Firefox.
2. Enable Text Size to level 3.
3. In DevTools on `[data-a11y-content]`:
   - If `document.documentElement.getAttribute('data-a11y-zoom-support') === '1'`
     → expect computed `zoom: 1.45`.
   - If `'0'` → expect `transform` scale + width compensation (no `zoom`).
4. Confirm toolbar chrome (outside content) does not scale.

## Hide Images

Uses `visibility: hidden` (preserves layout; less jump than `display: none`).
Restore rules keep `svg` / `[role=img]` inside `button`/`a` and
`svg[role=img][aria-label]` visible.

## Color Filter + Saturation

Single `filter` property: `saturate(var(--itzsa-a11y-saturation)) var(--itzsa-a11y-color-filter)`.
Presentation aid only — **not** a clinical color-vision correction (see README).

## Pause Animations

Kill-list: `animation`, `transition`, **`scroll-behavior`** on content and
descendants. Additive with `prefers-reduced-motion`.

## Bigger Cursor

`cursor: url(...) 2 2, auto` — keyword fallback required by CSS.
