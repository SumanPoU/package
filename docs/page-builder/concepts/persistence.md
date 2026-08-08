# Persistence (ADR-14 / ADR-16)

**Canonical saved document = validated `Page` JSON.** Full HTML is an optional derived export — never the source of truth for re-opening the editor.

## Artifacts

| Artifact | Default? | Role |
| --- | --- | --- |
| `Page` JSON | **Always** | Editable, migratable, locale/visibility/binding intact |
| Full HTML (+ CSS/JS) | On demand | CDN / email / non-React host snapshot |

## Host callbacks

```text
onSave(page, { expectedRevision })     # persist JSON (required in product hosts)
onPublish(page, { expectedRevision })  # published revision
onPublishHtml?(htmlBundle)             # optional derived snapshot
```

Engine never chooses a DB. If both JSON and HTML exist, **JSON wins on conflict**; regenerate HTML after edits via the same `RenderPage` / composers path.

## Concurrency (ADR-16)

- Every persisted page carries opaque `revision` (or HTTP ETag)
- Save/publish sends `expectedRevision` the editor loaded
- Host rejects stale writes with a typed conflict — **no silent last-write-wins** across tabs
- Editor surfaces reload-or-overwrite UI

## Hard rules

- Never treat saved HTML as authoritative for the editor
- Load → migrate by `schemaVersion` → parse; publish uses the same parse
- Failures are loud — never silent field drops

## Related

[preview](./preview.md) · [host-callbacks](../api/host-callbacks.md) · [data-model](./data-model.md)
