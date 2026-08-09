# @itzsa/page-builder

Drag-and-drop visual page builder for React (Elementor / Webflow / [Puck](https://puckeditor.com) class).

Authors compose pages from registered blocks. **You own the data** — persist structured `Page` JSON. Canvas, Preview, and Open Page share **one React render path**.

Full docs (site): `/page-builder` in this monorepo. Design authority: `ARCHITECTURE-PAGE-BUILDER.md`. Topic tree: `docs/page-builder/`.

## Features

| Feature | Description |
| --- | --- |
| Block registry | Register React blocks (or use primitives) with fields + `render` |
| Page JSON | Persist a schema-validated document — not a one-off HTML dump |
| Render parity | Same `render` for canvas / preview / open |
| Localization | First-class `i18nProps` with host-configured locales |
| Author CSS / JS | Look from composers — no engine decorative skins |
| Visibility | Device, locale, publish, `renderContext` predicates |
| Data sources | Repeater + `{{item.*}}` via `fetchDataSource` |
| Feature toggling | `capabilities` + host UI flags |

## Install

```bash
pnpm add @itzsa/page-builder zod
```

Peers: `react`, `react-dom` (^18 \|\| ^19).

```ts
import "@itzsa/page-builder/styles.css";
```

## Render the editor

```tsx
import { useState } from "react";
import {
  PageBuilder,
  createRegistry,
  registerPrimitives,
  createDefaultLocaleConfig,
  PAGE_SCHEMA_VERSION,
  type Page,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";

const registry = createRegistry();
registerPrimitives(registry);
const localeConfig = createDefaultLocaleConfig();

const initialPage: Page = {
  id: "home",
  schemaVersion: PAGE_SCHEMA_VERSION,
  revision: "1",
  meta: { title: "Home" },
  blocks: [],
};

export function Editor() {
  const [page, setPage] = useState(initialPage);
  const [locale, setLocale] = useState(localeConfig.defaultLocale);

  return (
    <PageBuilder
      page={page}
      onChange={setPage}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={locale}
      onActiveLocaleChange={setLocale}
      onSave={(next) => {
        void savePage(next);
      }}
      capabilities={{ allowCustomCss: true, allowCustomJs: false }}
    />
  );
}
```

## Render the page

```tsx
import {
  RenderPage,
  OpenPageView,
  createRegistry,
  registerPrimitives,
  createDefaultLocaleConfig,
  type Page,
} from "@itzsa/page-builder";

const registry = createRegistry();
registerPrimitives(registry);
const localeConfig = createDefaultLocaleConfig();

export function PageView({ page, locale }: { page: Page; locale: string }) {
  return (
    <RenderPage
      page={page}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={locale}
      surface="open"
    />
  );
}

export function PublishedPage({ page, locale }: { page: Page; locale: string }) {
  return (
    <OpenPageView
      page={page}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={locale}
    />
  );
}
```

## Show page on your site (save → fetch → render)

1. **Save** — `onSave` persists `Page` JSON to your API (not HTML as source of truth).
2. **Preview** (optional) — `createPreviewSession` + `buildPreviewUrl` → another route loads with `loadPreviewSession` + `OpenPageView` (opaque id in URL only).
3. **Public page** — fetch JSON by slug/id, then mount **`OpenPageView`** with the **same registry** as the editor.

```tsx
// Public route — this is the component visitors see
const page = await getPageBySlug(slug); // your backend

return (
  <OpenPageView
    page={page}
    registry={registry}
    localeConfig={localeConfig}
    activeLocale={localeConfig.defaultLocale}
  />
);
```

Full guide: `docs/page-builder/guides/show-page-on-site.md` · live docs `/page-builder#show-on-site`.

## Flex & Grid nesting

Drop **Flex** or **Grid** on the canvas, then drop other blocks into the dashed **Empty / Drop here** zone. Children are stored on `block.children`.

## Palette filters

```ts
palette={{
  hideCategories: ["other"],
  hideBlocks: ["html", "repeater"],
}}
```

## Locales

```ts
import {
  createDefaultLocaleConfig, // en + ne
  createEnglishOnlyLocaleConfig,
  createNepaliOnlyLocaleConfig,
  createLocaleConfig,
} from "@itzsa/page-builder";
```

## Validate author CSS / JS on save

```ts
import { validateAuthorCode } from "@itzsa/page-builder";

const result = validateAuthorCode(page);
if (!result.ok) {
  // reject — result.cssErrors / result.jsErrors
}
```

## License

MIT
