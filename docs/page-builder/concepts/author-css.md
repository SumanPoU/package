# Author CSS

Page look comes **only** from author-written CSS (`Block.customCss`, `Page.globalCss`) and optional structured styles that compile into the same artifacts. The engine does not ship decorative skins (ADR-03 / §6).

## Pipeline

```text
raw author CSS
  → cssParser (reject invalid / disallowed url / @import)
  → customCssComposer
       • per-block: scope to [data-block-id="…"]
       • global: unscoped within the page document
       • allow @media
  → injectStyles (canvas iframe) AND Open Page <head> — same output
```

## Precedence

`block.customCss` (most specific) → optional compiled panel style → `Page.globalCss` (loaded first / least specific).

## Hard rejects (parser)

| Construct | Rule |
| --- | --- |
| `@import` | Always reject |
| Remote `url(http…)` | Reject by default; host CDN allow-list optional |
| Protocol-relative `url(//…)` | Reject |
| Parent-escape selectors | Strip / reject |

## Capability

Gated by host `capabilities.allowCustomCss`. UI may hide Advanced CSS; **host must re-validate on save** (§22.6).

## Related

[custom-css-js guide](../guides/custom-css-js.md) · [security](./security.md) · [sandbox-policy](../api/sandbox-policy.md)
