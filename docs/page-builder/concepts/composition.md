# Composition (primitives + presets)

Complex UI is a **tree of primitives** (and optional presets that expand to trees). Locked mega-widgets (`blog-card`, composite heroes as single block types) are not the primary path (ADR-07).

## Shipped core primitives

**Layout:** `container` (Section), `box` (Inner Section), `flex` (Columns), `grid`, `divider`, `spacer`, `repeater`  
**Basic:** `heading`, `text` (Text Editor), `list`, `badge`, `icon`, `icon-list`, `button`, `code`, `quote`, `alert`, `tabs`, `accordion`, `toggle`, `social-icons`, `anchor` (Menu Anchor), `read-more`  
**Other:** `image`, `gallery`, `carousel`, `video`, `audio`, `map` (Google Maps), `embed`, `html`  
**Presets:** Card, Hero, Icon Box, Image Box, Testimonial

Palette groups (in order): **Layout → Basic → Presets → Other**.

## Motion

Optional `block.motion` (entrance + hover) — see [motion](./motion.md). Not a separate block type; every primitive can opt in via Advanced → Motion Effects.

WordPress-only Elementor widgets (**Shortcode**, **Sidebar**) are intentionally out of scope — this engine is host-agnostic.

## Presets (not block types)

`Card`, `Hero`, `Icon Box`, `Image Box`, and `Testimonial` insert nested primitive trees via the palette. Stored JSON remains editable blocks — never a frozen composite type.

## Forbidden as core types

| Pattern | Use instead |
| --- | --- |
| `blog-card` mega-widget | `repeater` + primitive template |
| Locked `icon-box` / `image-box` / `testimonial` block types | Presets above |
| WordPress Shortcode / Sidebar | Host-specific integration outside the engine |
| Parallel `*.render.ts` HTML string builders | Single React `render` in the registry |

## Limits

| Limit | Behavior |
| --- | --- |
| Nesting depth | No hard engine cap; hosts may enforce product limits on save |
| Unknown type | `FallbackBlock` — tree preserved |
| Tenant composites | Model A namespaced `registerBlock` or Model B JSON specs |

## Related

[data-model](./data-model.md) · [registry](./registry.md) · [data-binding](./data-binding.md) · [add-a-block](../guides/add-a-block.md)
