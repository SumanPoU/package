# Preview (PreviewPort)

Preview URLs carry only a **short opaque id/key** (and optional secret). The page payload never goes in the query/hash (ADR-11 / §20).

## Why

Multi-locale trees + CSS easily exceed browser/server URL limits (~2–64KB). Encoding full JSON causes truncation, 414, or blank previews.

## Strategies (host implements PreviewPort)

| Strategy | Flow | Use when |
| --- | --- | --- |
| **A — Draft API** (preferred) | `onCreatePreviewDraft(page)` → `draftId` → `/preview?draft=<id>` → `onResolvePreviewDraft` | Shareable / cross-device |
| **B — Tab-local store** | Store under `pb-preview:<id>` (sessionStorage or IndexedDB) → `/preview?key=<id>` | Unsaved / instant |
| **C — Forbidden** | `?data=<base64 page>` / hash JSON | Never |

Use IndexedDB when payload may exceed sessionStorage (~5MB). URL still only carries the key.

## Parity

| Surface | Data | Renderer |
| --- | --- | --- |
| Canvas | Live editor state | `RenderPage` |
| Preview | Draft API or keyed store | **Same** `RenderPage` |
| Open Page | Published persistence | **Same** `RenderPage` |

## Host hooks

```ts
onCreatePreviewDraft?(page) => { draftId }
onResolvePreviewDraft?(draftId) => page | null
// PageBuilder also accepts onPreview?(page) for host routing
```

## Related

[persistence](./persistence.md) · [render-parity](./render-parity.md) · [host-callbacks](../api/host-callbacks.md)
