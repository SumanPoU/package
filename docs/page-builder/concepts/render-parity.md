# Render parity

**Invariant:** For the same `Page` JSON + author CSS/JS + active locale + `renderContext`, **canvas === Preview === Open Page**.

## Contract

| Surface | Mount | Look source |
| --- | --- | --- |
| Canvas | `RenderPage` inside sandboxed iframe | Author CSS/JS only |
| Preview | Same `RenderPage` | Same |
| Open Page | Same `RenderPage` | Same |

One React `render` per block type (registry). No second HTML template, no `*.render.ts` string builder, no publish-only component.

## Editor chrome is not page content

Selection outlines, drag ghosts, hover rings, and toolbars live in the **parent** document (overlays via `canvasBridge` measurements). They must never be injected into the iframe page DOM or affect the visual contract.

## Engine must NOT

- Ship decorative default skins (card/hero/button padding/shadows) so the canvas “looks less empty”
- Maintain a second CSS path for canvas vs Open Page
- Special-case `switch (block.type)` outside registry dispatch

## Failure modes

| Drift | Fix |
| --- | --- |
| Canvas has styles Preview lacks | Remove engine/demo CSS; keep only composers |
| Overlay chrome visible on Open Page | Move chrome to parent overlays |
| Locale differs per surface | Same `i18nResolve` + `activeLocale` everywhere |

## Related

ADR-01–03 · [author-css](./author-css.md) · [preview](./preview.md) · [accessibility](./accessibility.md)
