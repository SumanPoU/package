# Field types (Model B)

Authoritative enum of Model B JSON field `kind` values. The engine maps each kind to Zod + inspector controls in `fieldAdapterResolve.ts`. **Any new `kind` must update this doc in the same PR.**

| Kind | Control | Notes |
| --- | --- | --- |
| `text` | text input | Optional `translatable` |
| `richText` | textarea | Still sanitized on render when used as HTML |
| `image` | url / media field | Author URL or host `uploadAsset` |
| `select` | `<select>` | Requires `options: { value, label }[]` |
| `boolean` | checkbox | |
| `number` | number input | |
| `url` | url input | |

## Spec shape

```ts
{
  key: "title",
  kind: "text",
  label?: "Title",
  translatable?: true,
  options?: [{ value: "a", label: "A" }], // select only
  defaultValue?: "Hello",
}
```

## Limits & failure modes

| Case | Behavior |
| --- | --- |
| Unknown `kind` at `registerDynamicBlock` | **Loud error** — not a silent text fallback |
| `select` without `options` | Guard / schema error at registration |
| `allowDynamicBlockDefs: false` | `registerDynamicBlock` throws |
| Template token `{{props.key}}` unknown | Empty string (same one-pass rules as repeater) |

## Related

[dynamic-block-data-binding](../guides/dynamic-block-data-binding.md) · [inspector-fields](../editor/inspector-fields.md) · [registerBlock](./registerBlock.md)
