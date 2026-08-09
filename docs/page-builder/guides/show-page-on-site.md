# Show page on your site (save → fetch → render)

After authors build a page in `PageBuilder`, **your app** stores `Page` JSON and **your public frontend** draws it. The component that paints the built page is `OpenPageView` (or `RenderPage` if you inject CSS yourself).

## Flow

```text
Editor (PageBuilder)
  └─ onSave(page) ──► your API / DB  (Page JSON)
                         │
Preview (optional)       │  createPreviewSession → /preview?preview=<id>
                         │  loadPreviewSession → OpenPageView
                         │
Public site              ▼
  GET /api/pages/:slug → page JSON → <OpenPageView page={page} … />
```

## 1. Save from the editor

```tsx
<PageBuilder
  page={page}
  onChange={setPage}
  registry={registry}
  localeConfig={localeConfig}
  activeLocale={locale}
  onActiveLocaleChange={setLocale}
  onSave={async (next, { expectedRevision }) => {
    await fetch(`/api/pages/${next.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: next, expectedRevision }),
    });
  }}
/>
```

Canonical artifact = **Page JSON** (ADR-14). HTML export is optional and never the source of truth for re-opening the editor.

## 2. Preview on another route

Do **not** put Page JSON in the query string. Use an opaque id:

```ts
import { createPreviewSession, buildPreviewUrl } from "@itzsa/page-builder";

const session = await createPreviewSession({
  page,
  activeLocale,
  store: "sessionStorage",
});
router.push(buildPreviewUrl("/page-builder/preview", session.id));
```

On the preview page, load the session and mount `OpenPageView` — see live demo: `/page-builder/preview` (opened from `/page-builder/create`).

## 3. Public frontend — the render component

```tsx
import {
  OpenPageView,
  createRegistry,
  registerPrimitives,
  createDefaultLocaleConfig,
  type Page,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";

const registry = createRegistry();
registerPrimitives(registry);
// register every custom block type the editor used

const localeConfig = createDefaultLocaleConfig();

export async function PublicPage({ page }: { page: Page }) {
  return (
    <OpenPageView
      page={page}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={localeConfig.defaultLocale}
    />
  );
}
```

| Piece | Role |
| --- | --- |
| `OpenPageView` | Public / preview renderer: author CSS/JS + `RenderPage` |
| `RenderPage` | Block tree only (same React `render` as the canvas) |
| `registry` | Must match the editor or types will be missing |
| `page` | Exact JSON you saved from `onSave` |

## Checklist

- [ ] `onSave` persists full `Page` JSON (incl. `revision`, `globalCss`, `blocks`)
- [ ] Public route fetches JSON by slug/id — URL never carries the document
- [ ] Same `registerPrimitives` + custom blocks as the editor
- [ ] Same `localeConfig`; pick `activeLocale` from request
- [ ] Optional: same `fetchDataSource` / `renderContext` for repeaters & visibility

## Related

[persistence](../concepts/persistence.md) · [preview](../concepts/preview.md) · [render-parity](../concepts/render-parity.md) · live docs `/page-builder#show-on-site`
