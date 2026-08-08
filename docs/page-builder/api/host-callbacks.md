# Host callbacks

Engine never imports host `services/` / `store/` / `routes/`. All I/O is injected (ADR-05).

## Persistence / preview

| Callback | Role |
| --- | --- |
| `onSave(page, { expectedRevision })` | Persist JSON; concurrency token (ADR-16) |
| `onPublish(page, …)` | Published revision (host product wiring) |
| `onPublishHtml?(bundle)` | Optional derived HTML snapshot (ADR-14) |
| `onPreview?(page)` / `onCreatePreviewDraft?` / `onResolvePreviewDraft?` | PreviewPort (§20) — id in URL only |
| `onOpenPage?(page)` | Navigate to live/published surface |
| `uploadAsset?` | Media upload (host) |
| `onCustomCodeChanged?` | Audit CSS/JS edits |

## Data / registration

| Callback | Role |
| --- | --- |
| `fetchDynamicBlocks?` | Model B JSON specs (§24) |
| `fetchDataSource(sourceId, params)` | Strategy B client fetch (§25) |
| `capabilities` | Who may CSS/JS / register / bind |
| `renderContext` | Locale, device, auth flags for visibility — **injected**, never fetched by engine |

## `fetchDataSource` (Strategy B)

```ts
type FetchDataSource = (
  sourceId: string,
  params: Record<string, unknown>,
) => Promise<{ items: Record<string, unknown>[] }>;
```

Strategy A (SSR) passes resolved items on `renderContext.dataSources` instead. Both must expand to the **same DOM** for one fixture (§25.3).

## Related

[PageBuilder](./PageBuilder.md) · [persistence](../concepts/persistence.md) · [data-binding](../concepts/data-binding.md) · [security](../concepts/security.md)
