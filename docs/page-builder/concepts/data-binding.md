# Data binding & repeaters

CMS loops are a **`repeater` primitive** + host DataSource + `{{item.*}}` tokens — not a monolithic blog-card widget (§25).

## Stored shape

```ts
{
  type: "repeater",
  dataBinding: {
    sourceId: "posts",
    params: { limit: 6 },
    itemTemplate: [], // optional override; children are the editable template when empty
  },
  children: [
    /* heading / text / image with {{item.title}} etc. */
  ],
}
```

## Tokens

Grammar (one pass, no filters/expressions):

```text
{{item.field}}
{{item.nested.path}}
```

- Missing path → `""`
- Invalid / incomplete `{{` → left as literal
- Values from CMS are **not** re-scanned for new tokens

## Host Strategy A (resolved items)

Pass items on `renderContext` (Preview / Open Page / SSR):

```ts
<RenderPage
  page={page}
  registry={registry}
  localeConfig={locales}
  activeLocale="en"
  renderContext={{
    locale: "en",
    device: "desktop",
    dataSources: {
      posts: {
        state: "ready",
        items: [
          { title: "One", image: "/a.jpg" },
          { title: "Two", image: "/b.jpg" },
        ],
      },
    },
  }}
/>
```

Engine expands via `expandRepeater` inside `RenderBlock` when `block.dataBinding` is set. Structural state: `data-binding-state="ready|empty|loading|error"` on the repeater root.

## Canvas

With no items (or empty source), canvas shows the **template children** for editing. Outline lists the repeater + template — not N expanded clones as persistent tree nodes.

## Strategy B — `fetchDataSource`

When the host cannot pre-resolve items (canvas / SPA Open Page), inject:

```ts
fetchDataSource: async (sourceId, params) => {
  // host-owned fetch — engine never imports services/
  return { items: await hostQuery(sourceId, params) };
};
```

Engine calls this callback and expands identically to Strategy A. **Cross-strategy parity:** A and B must produce the same DOM (order, tokens, `data-binding-state`) for one fixture DataSource (§25.3).

## `allowDataBinding` inert mode

If host `capabilities.allowDataBinding === false` (or the feature is gated off):

- Palette / inspector hide repeater DataSource controls
- Any `dataBinding` already present in loaded JSON is **inert**: render template once, **no live fetch**, no crash
- Prevents untrusted tenants from querying host DataSources via copied page JSON (§22.8)

Default when the flag is omitted: allowed (existing hosts keep working); explicit `false` gates.

## API

```ts
import {
  expandRepeater,
  resolveBindingString,
  applyBindingsToBlock,
  isDataBindingAllowed,
} from "@itzsa/page-builder";
```

## Related

- Visibility inside items: `visibleWhen` + `item.*` (§23.2.1)
- [host-callbacks](../api/host-callbacks.md) · [dynamic-blog-card](../guides/dynamic-blog-card.md)
