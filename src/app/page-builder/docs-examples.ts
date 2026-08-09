/** Shared code samples for page-builder docs (Puck-style copy blocks). */

export const INSTALL_CSS = `import "@itzsa/page-builder/styles.css";`;

export const EDITOR_EXAMPLE = `import { useState } from "react";
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
      onSave={(next, { expectedRevision }) => {
        // Persist Page JSON to your database
        void savePage(next, expectedRevision);
      }}
      capabilities={{
        allowCustomCss: true,
        allowCustomJs: false,
      }}
    />
  );
}`;

export const RENDER_PAGE_EXAMPLE = `import {
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

/** Same registry + page JSON as the editor — canvas / preview / open parity. */
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

/** Full document helper (injects composed author CSS/JS). */
export function PublishedPage({ page, locale }: { page: Page; locale: string }) {
  return (
    <OpenPageView
      page={page}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={locale}
    />
  );
}`;

export const REGISTER_BLOCK_EXAMPLE = `import {
  createRegistry,
  registerBlock,
  registerPrimitives,
  type BlockDefinition,
} from "@itzsa/page-builder";
import { z } from "zod";

const calloutDefinition: BlockDefinition = {
  type: "tenant:callout", // non-core types must be namespaced
  label: "Callout",
  category: "basic",
  source: "tenant",
  defaultProps: { tone: "info" },
  defaultI18nProps: {
    en: { body: "Note" },
    ne: { body: "नोट" },
  },
  translatableProps: ["body"],
  sharedProps: ["tone"],
  propsSchema: z
    .object({
      tone: z.enum(["info", "warn"]).optional(),
      body: z.string().optional(),
    })
    .passthrough(),
  render: ({ block, props }) => (
    <aside data-block-id={block.id} data-tone={String(props.tone ?? "info")}>
      {String(props.body ?? "")}
    </aside>
  ),
  ContentFields: ({ block, locale, onChange }) => (
    <label className="pb-field">
      <span className="pb-field-label">Body</span>
      <textarea
        aria-label="Callout body"
        value={String(block.i18nProps?.[locale]?.body ?? "")}
        onChange={(e) =>
          onChange({
            i18nProps: {
              ...block.i18nProps,
              [locale]: {
                ...block.i18nProps?.[locale],
                body: e.target.value,
              },
            },
          })
        }
      />
    </label>
  ),
};

const registry = createRegistry();
registerPrimitives(registry);
registerBlock(registry, calloutDefinition, {
  allowRegisterTenantBlocks: true,
});`;

export const DATA_MODEL_EXAMPLE = `{
  "id": "page-home",
  "schemaVersion": 1,
  "revision": "3",
  "meta": { "title": "Home" },
  "globalCss": "[data-pb-page] { font-family: system-ui; }",
  "blocks": [
    {
      "id": "b1",
      "type": "heading",
      "props": { "level": "h1" },
      "i18nProps": {
        "en": { "title": "Welcome" },
        "ne": { "title": "स्वागत छ" }
      }
    }
  ]
}`;

export const LOCALES_EXAMPLE = `import {
  createDefaultLocaleConfig,
  createEnglishOnlyLocaleConfig,
  createNepaliOnlyLocaleConfig,
  createLocaleConfig,
} from "@itzsa/page-builder";

createDefaultLocaleConfig();      // English + Nepali
createEnglishOnlyLocaleConfig(); // English only
createNepaliOnlyLocaleConfig();  // Nepali only

createLocaleConfig([
  { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en"] },
  { code: "hi", label: "हिन्दी", dir: "ltr", flatSuffixes: ["hi"] },
]);`;

export const CSS_EXAMPLE = `/* Page.globalCss */
[data-pb-page] {
  font-family: Georgia, serif;
  color: #1c1917;
}

[data-block-type="heading"] {
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

[data-block-type="button"] {
  display: inline-block;
  padding: 0.55rem 1rem;
  background: #1c1917;
  color: #fafaf9;
}

@media (max-width: 640px) {
  [data-block-type="heading"] { font-size: 1.5rem; }
}`;

export const UPLOAD_EXAMPLE = `import { PageBuilder, type UploadAsset } from "@itzsa/page-builder";

const uploadAsset: UploadAsset = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/page-builder/upload", {
    method: "POST",
    body: form,
  });
  const { url } = await res.json();
  return { url }; // CDN / media URL stored on image props.src
};

<PageBuilder
  /* … */
  uploadAsset={uploadAsset}
/>`;

export const VISIBILITY_EXAMPLE = `// Default: omit visibility → always shown
{
  "id": "promo",
  "type": "text",
  "props": {},
  "i18nProps": { "en": { "body": "Desktop only" } },
  "visibility": {
    "hiddenDevices": ["mobile"],
    "hiddenLocales": ["ne"],
    "hiddenOnPublish": false
  },
  "visibleWhen": {
    "allOf": [{ "key": "auth.isLoggedIn", "equals": true }]
  }
}`;

export const DATA_BINDING_EXAMPLE = `<PageBuilder
  /* … */
  fetchDataSource={async (sourceId) => {
    const items = await api.list(sourceId);
    return { items };
  }}
/>

// Inside a Repeater template, bind with {{item.title}}`;

export const CAPABILITIES_EXAMPLE = `capabilities={{
  allowCustomCss: true,
  allowCustomJs: false,
  allowDataBinding: true,
  allowRegisterTenantBlocks: true,
  allowRegisterPluginBlocks: false,
  allowDynamicBlockDefs: true,
}}`;

export const CANVAS_MODE_EXAMPLE = `<PageBuilder
  canvasMode="iframe"
  canvasSrc="/page-builder/canvas"
  /* … */
/>

// Or host create flags:
// CREATE_FEATURES.canvasMode = "embedded" | "iframe"`;

export const THEME_EXAMPLE = `.pb-root,
[data-pb-editor] {
  --pb-accent: #0f766e;
  --pb-accent-fg: #ecfdf5;
  --pb-fg: #0f172a;
  --pb-muted: #64748b;
  --pb-border: #e2e8f0;
  --pb-surface: #ffffff;
  --pb-page: #f8fafc;
}`;

export const DYNAMIC_BLOCK_EXAMPLE = `import {
  createRegistry,
  registerPrimitives,
  registerDynamicBlock,
  type DynamicBlockSpec,
} from "@itzsa/page-builder";

const spec: DynamicBlockSpec = {
  type: "tenant:promo", // must be namespaced
  label: "Promo",
  source: "tenant",
  fields: [
    { key: "title", kind: "text", translatable: true },
    { key: "image", kind: "image" },
    { key: "href", kind: "url" },
  ],
  template: [
    {
      type: "box",
      children: [
        { type: "image", props: { src: "{{props.image}}" } },
        {
          type: "heading",
          i18nProps: { en: { title: "{{props.title}}" } },
        },
        {
          type: "button",
          props: { href: "{{props.href}}" },
          i18nProps: { en: { label: "Go" } },
        },
      ],
    },
  ],
};

const registry = createRegistry();
registerPrimitives(registry);
registerDynamicBlock(registry, spec);`;

export const BLOG_CARD_TREE_EXAMPLE = `repeater  (dataBinding → sourceId: "posts", params: { limit: 6 })
└── template (children):
    box
    ├── image     src: {{item.image}}
    ├── heading   text: {{item.title}}
    ├── text      body: {{item.excerpt}}
    └── button    label: {{item.cta}}  href: {{item.url}}`;

export const ADD_LOCALE_EXAMPLE = `const locales: LocaleConfig = {
  locales: [
    { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en"] },
    { code: "ne", label: "नेपाली", dir: "ltr", flatSuffixes: ["ne", "np"] },
    { code: "hi", label: "हिन्दी", dir: "ltr", flatSuffixes: ["hi"] },
  ],
  defaultLocale: "en",
  fallbackLocale: "en",
  localeStorage: "nested",
};`;

export const VALIDATE_EXAMPLE = `import { validateAuthorCode } from "@itzsa/page-builder";

const result = validateAuthorCode(page, {
  allowedUrlOrigins: ["https://cdn.example.com"],
});

if (!result.ok) {
  // Reject save — result.cssErrors / result.jsErrors
}`;

export const FLEX_GRID_EXAMPLE = `// Drag Flex or Grid onto the canvas, then drop Heading / Text / Image
// into the dashed "Empty" / "Drop here" zone inside the container.

// Flex Content fields
{ direction: "row", justifyContent: "space-between", gap: "16px" }

// Grid Content fields
{ columns: "3", gap: "16px", rowGap: "24px" }

// Containers are isContainer: true — children live in block.children[]
{
  "id": "flex-1",
  "type": "flex",
  "props": { "direction": "row", "gap": "16px" },
  "children": [
    { "id": "h1", "type": "heading", "props": {}, "i18nProps": { "en": { "title": "Left" } } },
    { "id": "h2", "type": "heading", "props": {}, "i18nProps": { "en": { "title": "Right" } } }
  ]
}`;

export const BACKGROUND_EXAMPLE = `// Style tab → Background Type: Color | Image
// Also on Box / Flex / Grid Content fields

{
  "backgroundType": "image",
  "backgroundImage": "https://cdn.example.com/hero.jpg",
  "backgroundSize": "cover",
  "backgroundOpacity": "100",
  "backgroundOverlay": "40"   // dark overlay %
}

// Color mode
{
  "backgroundType": "color",
  "backgroundColor": "#0f172a",
  "backgroundOpacity": "100",
  "backgroundOverlay": "0"
}`;

export const TYPOGRAPHY_EXAMPLE = `// Style tab — Typography
patchStyle({
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", // or type a custom stack
  fontSize: "18",
  fontSizeUnit: "px",
  fontWeight: "600",           // type any CSS weight (100–900 or bold)
  letterSpacing: "0.02",
  letterSpacingUnit: "em",     // px | em | rem
});

// Host can pass extra fonts into the inspector:
fontFamilies={[
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Noto Sans Devanagari", value: "'Noto Sans Devanagari', sans-serif" },
]}`;

export const PALETTE_CONFIG_EXAMPLE = `import type { PaletteConfig } from "@itzsa/page-builder";

const palette: PaletteConfig = {
  hideCategories: ["embeds", "presets"], // basic | layout | media | embeds | presets
  hideBlocks: ["html", "repeater"],      // by block type id
  // hidePresets: true,                  // or ["hero", "card"]
};

// Create demo host:
// <CreateLeftSidebar palette={palette} … />
// Package ElementsPanel also accepts palette={…}`;

export const HOST_CHROME_EXAMPLE = `const CREATE_FEATURES = {
  showHeader: true,
  showCodePanel: true,   // HTML/JSON code panel
  showPreview: true,
  showOpenPage: true,
  showPublish: true,
};

// Locale ne → header shows / edits meta.title_np (Nepali page name)`;

/** Editor → backend: persist Page JSON only (not HTML). */
export const SAVE_TO_BACKEND_EXAMPLE = `// In your editor host
<PageBuilder
  page={page}
  onChange={setPage}
  registry={registry}
  localeConfig={localeConfig}
  activeLocale={locale}
  onActiveLocaleChange={setLocale}
  onSave={async (next, { expectedRevision }) => {
    const res = await fetch(\`/api/pages/\${next.id}\`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: next,
        expectedRevision, // optimistic concurrency
      }),
    });
    if (res.status === 409) {
      // conflict — reload or overwrite UI
      return;
    }
    if (!res.ok) throw new Error("Save failed");
  }}
/>`;

/** Preview on another route (demo pattern — opaque id in URL, never full JSON). */
export const PREVIEW_ROUTE_EXAMPLE = `// 1) Editor — Preview button
import {
  createPreviewSession,
  buildPreviewUrl,
} from "@itzsa/page-builder";

const handlePreview = async () => {
  const session = await createPreviewSession({
    page,
    activeLocale,
    store: "sessionStorage", // or "indexedDB" for large pages
  });
  // URL is only /preview?preview=<opaque-id> — never ?data=<json>
  router.push(buildPreviewUrl("/page-builder/preview", session.id));
};

// 2) app/page-builder/preview/page.tsx — load + render
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  OpenPageView,
  createRegistry,
  registerPrimitives,
  createDefaultLocaleConfig,
  getPreviewIdFromUrl,
  loadPreviewSession,
  type Page,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";

const localeConfig = createDefaultLocaleConfig();

export default function PreviewPage() {
  const registry = useMemo(() => {
    const r = createRegistry();
    registerPrimitives(r);
    // register the SAME custom blocks as the editor
    return r;
  }, []);

  const [page, setPage] = useState<Page | null>(null);
  const [locale, setLocale] = useState(localeConfig.defaultLocale);

  useEffect(() => {
    const id = getPreviewIdFromUrl(window.location.href, "preview");
    if (!id) return;
    void loadPreviewSession(id).then((session) => {
      if (!session) return;
      setPage(session.page as Page);
      setLocale(session.activeLocale);
    });
  }, []);

  if (!page) return <p>Loading preview…</p>;

  return (
    <OpenPageView
      page={page}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={locale}
    />
  );
}`;

/** Public frontend: fetch saved JSON from your API, then mount OpenPageView. */
export const PUBLIC_PAGE_EXAMPLE = `// app/pages/[slug]/page.tsx  (public site)
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
// Must match editor: registerBlock / registerDynamicBlock for every type on the page
const localeConfig = createDefaultLocaleConfig();

async function getPageBySlug(slug: string): Promise<Page | null> {
  // Your backend — returns the same Page JSON you saved from onSave
  const res = await fetch(\`\${process.env.API_URL}/pages/\${slug}\`, {
    next: { tags: [\`page-\${slug}\`] },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { page: Page };
  return data.page;
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return <p>Not found</p>;

  const locale = localeConfig.defaultLocale;

  return (
    <main>
      {/* THIS is the component that draws the built page */}
      <OpenPageView
        page={page}
        registry={registry}
        localeConfig={localeConfig}
        activeLocale={locale}
        // surface is "open" inside OpenPageView
        capabilities={{
          allowCustomCss: true,
          allowCustomJs: false,
        }}
      />
    </main>
  );
}

// Client-only alternative (if you fetch in useEffect):
// const [page, setPage] = useState<Page | null>(null);
// useEffect(() => { void fetch(...).then(r => r.json()).then(d => setPage(d.page)); }, [slug]);
// return page ? <OpenPageView page={page} ... /> : null;`;

export const FEATURES_TABLE: { feature: string; description: string }[] = [
  {
    feature: "Block registry",
    description:
      "Register your own React blocks (or use built-in primitives) with fields, defaults, and render.",
  },
  {
    feature: "Page JSON",
    description:
      "You own the data. Persist a structured Page document — not a one-off HTML dump.",
  },
  {
    feature: "Render parity",
    description:
      "Canvas, Preview, and Open Page share one React render path for the same JSON + CSS + locale.",
  },
  {
    feature: "Localization",
    description:
      "First-class i18nProps with host-configured locales (English, Nepali, or any set you define).",
  },
  {
    feature: "Author CSS / JS",
    description:
      "Page look comes from author CSS composers — not engine decorative skins. JS is capability-gated.",
  },
  {
    feature: "Visibility",
    description:
      "Show or hide blocks by device, locale, publish state, or renderContext predicates.",
  },
  {
    feature: "Presets & composition",
    description:
      "Card / Hero presets expand to editable primitive trees — prefer composition over mega-widgets.",
  },
  {
    feature: "Data sources",
    description:
      "Repeater + {{item.*}} binding with host-fed fetchDataSource (or SSR dataSources).",
  },
  {
    feature: "Feature toggling",
    description:
      "capabilities and host UI flags gate CSS, JS, Code panel, registration, and canvas mode.",
  },
  {
    feature: "Images & media",
    description:
      "Preview, content width, alignment, link, CDN uploadAsset or Base64.",
  },
  {
    feature: "Background",
    description:
      "Background Type color | image with opacity and dark overlay.",
  },
  {
    feature: "Flex & Grid",
    description:
      "Nest blocks inside flex/grid; direction, columns, gap, and drop zones.",
  },
  {
    feature: "Palette filters",
    description:
      "PaletteConfig hideCategories / hideBlocks / hidePresets.",
  },
];
