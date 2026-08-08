# Guide: dynamic blog card (repeater)

CMS “blog cards” are a **`repeater` + DataSource + primitive template** — not a locked `blog-card` widget (§25 / ADR-07).

## Tree

```text
repeater  (dataBinding → sourceId: "posts", params: { limit: 6 })
└── template (children):
    box
    ├── image     src: {{item.image}}
    ├── heading   text: {{item.title}}
    ├── text      body: {{item.excerpt}}
    └── button    label: {{item.cta}}  href: {{item.url}}
```

Same primitives as a Card preset; only the binding layer is new.

## Host wiring

1. Register DataSource metadata (`posts` + `itemSchema`).
2. Strategy A: resolve items into `renderContext.dataSources.posts` (SSR / Open Page).
3. Strategy B: pass `fetchDataSource` into `PageBuilder` / Open Page for client fetch.
4. Ensure `capabilities.allowDataBinding` is allowed (else binding is **inert**).
5. Verify A and B expand to identical DOM for one fixture.

## Authoring

- Outline edits the **template**, not N clones
- Canvas may show sample/live expansion (render-time)
- Tokens: `{{item.field}}` only — one pass, no filters

## Related

[data-binding](../concepts/data-binding.md) · [composition](../concepts/composition.md) · [host-callbacks](../api/host-callbacks.md)
