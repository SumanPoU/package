# `PageBuilder`

Top-level editor shell: palette, outline, canvas iframe, inspector, overlays, history, clipboard, DnD.

```ts
import { PageBuilder, createRegistry, registerPrimitives } from "@itzsa/page-builder";
```

## Props (contract)

| Prop | Required | Role |
| --- | --- | --- |
| `page` / `onChange` | yes | Controlled `Page` document |
| `registry` | yes | Live block registry |
| `localeConfig` / `activeLocale` / `onActiveLocaleChange` | yes | Content i18n |
| `onSave?(page, { expectedRevision })` | no | Persist JSON (ADR-14/16) |
| `onPreview?(page)` | no | Host opens PreviewPort |
| `onOpenPage?(page)` | no | Host navigates to published view |
| `capabilities?` | no | Gate CSS/JS/registration/binding |
| `renderContext?` | no | Visibility / device / locale bag |
| `fetchDataSource?` | no | Strategy B client fetch (§25) |
| `selectedId?` / `onSelectedIdChange?` | no | Controlled selection |
| `title?` | no | Toolbar label |

## Invariants

- Host owns I/O — engine does not import host `services/` / `store/` / `routes/`
- Canvas uses sandboxed iframe; chrome stays in parent
- Same registry + composers feed Preview / Open Page when host mounts `RenderPage`

## Minimal mount

```tsx
<PageBuilder
  page={page}
  onChange={setPage}
  registry={registry}
  localeConfig={locales}
  activeLocale={locale}
  onActiveLocaleChange={setLocale}
  onSave={(p, opts) => savePage(p, opts)}
  capabilities={{ allowCustomJs: false }}
/>
```

## Related

[host-callbacks](./host-callbacks.md) · [registerBlock](./registerBlock.md) · [preview](../concepts/preview.md)
