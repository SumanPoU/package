# Inspector fields

The inspector (Content / Style / Advanced) is the dynamic field system for editing block props. Locale-aware: active locale switches canvas **and** inspector together via `i18nResolve` (§19).

## Contract

| Concern | Rule |
| --- | --- |
| Data vs fields | `Page` JSON holds values; `BlockDefinition.ContentFields` / `propsSchema` describe controls |
| Translatable | Declared in `translatableProps` / `i18nProps` — never hardcode `switch (lang)` |
| Shared | URLs, layout flags, tones live in `props` / `sharedProps` |
| Model B | JSON field `kind` → engine `fieldAdapterResolve` — enum in [field-types](../api/field-types.md) |
| Rich text | Values pass `sanitizeRichText` on render |
| Capabilities | Hide CSS/JS / DataSource / registration UI when `capabilities` deny |

## Tabs

| Tab | Contents |
| --- | --- |
| **Content** | Typed props for the active locale (`ContentFields`) |
| **Style** | Shared visual props (background, typography) when the block exposes them |
| **Advanced** | Motion Effects (`block.motion`), CSS id/classes, `customCss` / `customJs` (capability-gated), visibility |
| **Binding** | Repeater / DataSource when `allowDataBinding` |

## Motion Effects (Advanced)

| Field | Notes |
| --- | --- |
| `motion.entrance` | CSS keyframe preset; omit / `none` = no entrance CSS |
| `motion.trigger` | `scroll` (default) or `load` |
| `motion.durationMs` / `delayMs` | Composed as CSS variables on `.b-{id}` |
| `motion.hover` | CSS-only hover transform |

See [motion](../concepts/motion.md) and [motion-effects](../guides/motion-effects.md).

## Limits & failure modes

| Case | Behavior |
| --- | --- |
| Missing locale value | Fallback locale via `i18nResolve` (empty string ≠ missing) |
| Unknown Model B `kind` | Registration error — not a silent text field |
| Cap denied | Controls hidden; server must still reject forbidden payloads |

## Extending

- Model A: ship `ContentFields` + Zod `propsSchema` with the definition
- Model B: declare `fields: [{ key, kind, … }]`; engine generates controls
- New Model B `kind` → update `field-types.md` in the same PR

## Related

[field-types](../api/field-types.md) · [locales](../concepts/locales.md) · [registerBlock](../api/registerBlock.md) · [visibility](../concepts/visibility.md)
