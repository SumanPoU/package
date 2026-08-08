# Dynamic blocks (Model B)

Model B adds block types from **JSON specs** — field definitions + a composition tree of **existing primitives**. No downloaded `render` JS, no `eval` (§24.2).

## Flow

1. Host fetches specs (`fetchDynamicBlocks` — host-owned, ADR-05).
2. Host calls `registerDynamicBlocks(registry, specs)` after `registerPrimitives`.
3. Live registry `.refine()` accepts the new `type`s.
4. Insert / render uses engine-generated `ContentFields` + template expansion.

## Spec

```ts
import {
  createRegistry,
  registerPrimitives,
  registerDynamicBlock,
  type DynamicBlockSpec,
} from "@itzsa/page-builder";

const spec: DynamicBlockSpec = {
  type: "tenant:promo", // must be namespaced
  label: "Promo",
  source: "tenant",
  fields: [
    { key: "title", kind: "text", translatable: true },
    { key: "image", kind: "image" },
    { key: "href", kind: "url" },
  ],
  template: [
    {
      type: "box",
      children: [
        { type: "image", props: { src: "{{props.image}}" } },
        {
          type: "heading",
          i18nProps: { en: { title: "{{props.title}}" } },
        },
        {
          type: "button",
          props: { href: "{{props.href}}" },
          i18nProps: { en: { label: "Go" } },
        },
      ],
    },
  ],
};

const registry = createRegistry();
registerPrimitives(registry);
registerDynamicBlock(registry, spec);
```

## Tokens

Template strings may use `{{props.fieldKey}}` (same one-pass rules as repeater `{{item.*}}`).

## Capabilities

```ts
registerDynamicBlock(registry, spec, { allowDynamicBlockDefs: false }); // throws
```

## Field kinds

See [field-types.md](../api/field-types.md).

## Related

- Model A (bundled custom `render`): [register-custom-block](./register-custom-block.md)
- Repeaters / CMS loops: [data-binding](../concepts/data-binding.md)
