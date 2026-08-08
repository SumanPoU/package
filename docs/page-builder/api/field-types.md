# Field types (Model B)

Authoritative enum of Model B JSON field `kind` values. The engine maps each kind to Zod + inspector controls in `fieldAdapterResolve.ts`. **Any new `kind` must update this doc in the same PR.**

| Kind | Control | Notes |
| --- | --- | --- |
| `text` | text input | Optional `translatable` |
| `richText` | textarea | Still sanitized on render when used as HTML |
| `image` | url input | Author supplies URL; host may later inject uploader |
| `select` | `<select>` | Requires `options: { value, label }[]` |
| `boolean` | checkbox | |
| `number` | number input | |
| `url` | url input | |

Unknown `kind` at `registerDynamicBlock` time → **loud error** (not a silent text fallback).

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
