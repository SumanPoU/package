# Render parity

**Invariant:** For the same `Page` JSON + author CSS/JS + active locale + `renderContext`, **canvas === Preview === Open Page**.

## Contract

| Surface | Mount | Look source |
| --- | --- | --- |
| Canvas | `RenderPage` (embedded or iframe shell) | Author CSS/JS only |
| Preview | Same `RenderPage` / `OpenPageView` | Same |
| Open Page | Same `RenderPage` / `OpenPageView` | Same |

One React `render` per block type (registry). No second HTML template, no `*.render.ts` string builder, no publish-only component.

## Parity test contract (§14)

Hosts / CI should assert for one fixture page:

1. Same registry + `localeConfig` + `activeLocale` + `renderContext` on all three surfaces  
2. Composed author CSS/JS identical (same composers)  
3. DOM for page content comparable (ignore parent overlay chrome)  
4. Visibility + repeater expansion match across surfaces  

## Editor chrome is not page content

Selection outlines, drag ghosts, hover rings, and toolbars live in the **parent** document (overlays via `canvasBridge`). Never inject into the iframe page DOM.

## Engine must NOT

- Ship decorative default skins so the canvas “looks less empty”
- Maintain a second CSS path for canvas vs Open Page
- Special-case `switch (block.type)` outside registry dispatch

## Failure modes

| Drift | Fix |
| --- | --- |
| Canvas has styles Preview lacks | Remove engine/demo CSS; keep only composers |
| Overlay chrome visible on Open Page | Move chrome to parent overlays |
| Locale differs per surface | Same `i18nResolve` + `activeLocale` everywhere |
| Registry mismatch | Missing types → `FallbackBlock` / blank — register the same set everywhere |

## Limits

| Limit | Behavior |
| --- | --- |
| Preview URL size | Opaque session id only — never serialize Page JSON into the query |
| Iframe vs embedded canvas | Page look must still match; only chrome/isolation differs |

## Related

ADR-01–03 · [author-css](./author-css.md) · [preview](./preview.md) · [accessibility](./accessibility.md)
