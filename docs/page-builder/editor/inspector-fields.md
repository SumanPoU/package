# Inspector fields

The inspector (Content / Advanced tabs) is the dynamic field system for editing block props. Locale-aware: active locale switches canvas **and** inspector together via `i18nResolve` (§19).

## Contract

| Concern | Rule |
| --- | --- |
| Data vs fields | `Page` JSON holds values; `BlockDefinition.ContentFields` / `propsSchema` describe controls |
| Translatable | Declared in `translatableProps` / `i18nProps` — never hardcode `switch (lang)` |
| Shared | URLs, layout flags live in `props` / `sharedProps` |
| Model B | JSON field `kind` → engine `fieldAdapterResolve` — enum in [field-types](../api/field-types.md) |
| Rich text | Values pass `sanitizeRichText` on render |
| Capabilities | Hide CSS/JS / DataSource when `capabilities` deny |

## Tabs (conceptual)

- **Content** — typed props for the active locale
- **Advanced** — `customCss` / `customJs` (capability-gated)
- **Visibility / Binding** — when those phases are enabled

## Extending

- Model A: ship `ContentFields` + Zod `propsSchema` with the definition
- Model B: declare `fields: [{ key, kind, … }]`; engine generates controls
- New Model B `kind` → update `field-types.md` in the same PR

## Related

[field-types](../api/field-types.md) · [locales](../concepts/locales.md) · [registerBlock](../api/registerBlock.md)
