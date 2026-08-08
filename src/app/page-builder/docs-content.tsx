"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { InstallCommand } from "@/components/install-command";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
  type PropRow,
} from "./docs-ui";
import { DOC_NAV } from "./nav";

const STARTER = `import {
  PageBuilder,
  createRegistry,
  registerPrimitives,
  createDefaultLocaleConfig,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";

const registry = createRegistry();
registerPrimitives(registry);
const localeConfig = createDefaultLocaleConfig();

export function Editor({ page, onChange }) {
  return (
    <PageBuilder
      page={page}
      onChange={onChange}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={localeConfig.defaultLocale}
      onActiveLocaleChange={() => {}}
      onSave={(next) => persist(next)}
      capabilities={{
        allowCustomCss: true,
        allowCustomJs: false, // recommended default
      }}
    />
  );
}`;

const VISIBILITY_EXAMPLE = `// Default: omit visibility → block is always shown
{
  "id": "hero-1",
  "type": "heading",
  "props": { "level": "h1" },
  "i18nProps": { "en": { "title": "Welcome" } }
}

// Hide on mobile + hide when locale is Nepali + hide on publish
{
  "id": "promo-1",
  "type": "text",
  "props": {},
  "i18nProps": { "en": { "body": "Desktop-only promo" } },
  "visibility": {
    "hiddenDevices": ["mobile"],
    "hiddenLocales": ["ne"],
    "hiddenOnPublish": false,
    "hiddenOnCanvas": false
  }
}

// Show only when logged in (your app passes renderContext.auth)
{
  "id": "member-only",
  "type": "box",
  "props": { "as": "section" },
  "visibleWhen": {
    "allOf": [{ "key": "auth.isLoggedIn", "equals": true }]
  },
  "children": [/* … */]
}`;

const REGISTER_BLOCK = `import {
  createRegistry,
  registerBlock,
  registerPrimitives,
  type BlockDefinition,
} from "@itzsa/page-builder";
import { z } from "zod";

const calloutDefinition: BlockDefinition = {
  type: "tenant:callout",          // MUST be tenant:… or plugin:vendor.name
  label: "Callout",
  category: "basic",
  source: "tenant",
  defaultProps: { tone: "info" },
  defaultI18nProps: { en: { body: "Note" }, ne: { body: "नोट" } },
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
  ContentFields: ({ block, onChange, locale }) => (
    <textarea
      aria-label="Callout body"
      value={String(block.i18nProps?.[locale]?.body ?? "")}
      onChange={(e) =>
        onChange({
          i18nProps: {
            ...block.i18nProps,
            [locale]: { ...block.i18nProps?.[locale], body: e.target.value },
          },
        })
      }
    />
  ),
};

const registry = createRegistry();
registerPrimitives(registry);
registerBlock(registry, calloutDefinition, {
  allowRegisterTenantBlocks: true,
});`;

const CSS_EXAMPLES = `/* Page.globalCss — applies to the whole page document */
[data-pb-page] {
  font-family: "IBM Plex Sans", system-ui, sans-serif;
  color: #1c1917;
  line-height: 1.5;
}

[data-block-type="heading"] {
  letter-spacing: -0.02em;
  margin: 0 0 0.75rem;
}

[data-block-type="button"] {
  display: inline-block;
  padding: 0.55rem 1rem;
  background: #1c1917;
  color: #fafaf9;
  text-decoration: none;
}

/* Responsive — allowed */
@media (max-width: 640px) {
  [data-block-type="heading"] { font-size: 1.5rem; }
}

/* Block.customCss — engine scopes it to THIS block only */
& {
  padding: 1.5rem;
  border-radius: 12px;
  background: #f5f5f4;
}`;

const IMAGE_HOST = `// Image block stores one string: props.src
// Your host decides HOW that string is produced.

// 1) CDN / object storage (recommended for production)
async function handleUpload(file: File) {
  const form = new FormData();
  form.append("file", file);
  const { url } = await fetch("/api/upload", { method: "POST", body: form })
    .then((r) => r.json());
  // url like https://cdn.example.com/pages/abc.webp
  updateBlock(page, blockId, { props: { src: url } });
}

// 2) Any public URL (external or relative)
updateBlock(page, blockId, {
  props: { src: "https://images.example.com/hero.jpg" },
});

// 3) Base64 data URI (fine for tiny icons / demos — avoid large files in JSON)
const reader = new FileReader();
reader.onload = () => {
  updateBlock(page, blockId, { props: { src: String(reader.result) } });
};
reader.readAsDataURL(file);`;

const LOCALES_EN_ONLY = `import type { LocaleConfig } from "@itzsa/page-builder";

/** English only */
export const englishOnly: LocaleConfig = {
  locales: [
    { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en"] },
  ],
  defaultLocale: "en",
  fallbackLocale: "en",
  localeStorage: "nested",
};`;

const LOCALES_NE_ONLY = `/** Nepali only */
export const nepaliOnly: LocaleConfig = {
  locales: [
    { code: "ne", label: "नेपाली", dir: "ltr", flatSuffixes: ["ne", "np"] },
  ],
  defaultLocale: "ne",
  fallbackLocale: "ne",
  localeStorage: "nested",
};`;

const LOCALES_MULTI = `/** English + Nepali + Hindi (scalable — add as many as you need) */
export const multiLocale: LocaleConfig = {
  locales: [
    { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en", "eng"] },
    { code: "ne", label: "नेपाली", dir: "ltr", flatSuffixes: ["ne", "np"] },
    { code: "hi", label: "हिन्दी", dir: "ltr", flatSuffixes: ["hi"] },
  ],
  defaultLocale: "en",
  fallbackLocale: "en",
  localeStorage: "nested",
};

// Toolbar shows whatever is in localeConfig.locales
// Authors fill i18nProps.en / i18nProps.ne / i18nProps.hi separately`;

const CAPABILITIES = `capabilities={{
  allowCustomCss: false,            // hide Advanced CSS; reject edits
  allowCustomJs: false,             // hide Custom JS
  allowDataBinding: true,           // Repeater + {{item.*}}
  allowRegisterTenantBlocks: true,  // registerBlock source: "tenant"
  allowRegisterPluginBlocks: false, // reject plugin:* registration
  allowDynamicBlockDefs: true,      // Model B JSON specs
}}`;

const HOST_UI = `// Create host example (this site):
const CREATE_FEATURES = {
  showCodePanel: false, // ← hides Code button + HTML/JSON modal
};

<EditorHeader
  showCodePanel={CREATE_FEATURES.showCodePanel}
  /* …other props */
/>

// Same idea on any host — gate YOUR toolbar, not the page JSON.`;

const EDITOR_THEME = `/* After importing @itzsa/page-builder/styles.css, override tokens */
.pb-root,
[data-pb-editor] {
  --pb-accent: #0f766e;
  --pb-accent-fg: #ecfdf5;
  --pb-fg: #0f172a;
  --pb-muted: #64748b;
  --pb-border: #e2e8f0;
  --pb-surface: #ffffff;
  --pb-page: #f8fafc;
}

/* Or target panel classes directly */
.pb-sidebar { width: 280px; }
.pb-toolbar { background: #0f172a; color: #f8fafc; }
.pb-panel-title { letter-spacing: 0.02em; }
.pb-elements-tile:hover { border-color: var(--pb-accent); }`;

const PAGE_BUILDER_PROPS: PropRow[] = [
  {
    name: "page / onChange",
    type: "Page · (page) => void",
    description: "Controlled page document. Required.",
  },
  {
    name: "registry",
    type: "BlockRegistry",
    description: "Allowed block types. Required.",
  },
  {
    name: "localeConfig / activeLocale / onActiveLocaleChange",
    type: "LocaleConfig · string · fn",
    description: "Languages + which one is being edited.",
  },
  {
    name: "capabilities?",
    type: "PageBuilderCapabilities",
    description: "Turn CSS/JS/registration/binding on or off.",
  },
  {
    name: "renderContext?",
    type: "Partial<RenderContext>",
    description: "Device, auth, flags for show/hide rules.",
  },
  {
    name: "fetchDataSource?",
    type: "FetchDataSource",
    description: "Load list items for Repeater blocks.",
  },
  {
    name: "onSave? / onPreview? / onOpenPage?",
    type: "callbacks",
    description: "Your persistence and navigation.",
  },
];

const HOST_CALLBACKS: PropRow[] = [
  {
    name: "onSave",
    type: "you provide",
    description: "Write Page JSON. Use expectedRevision for conflict checks.",
  },
  {
    name: "onPreview / onOpenPage",
    type: "you provide",
    description: "Open preview/live URLs (id only in the address bar).",
  },
  {
    name: "fetchDataSource",
    type: "you provide",
    description: "Return { items } for repeater source ids.",
  },
  {
    name: "Image upload (host)",
    type: "you provide",
    description:
      "Upload file → CDN/base64/URL → set image block props.src. Engine stores the string only.",
  },
];

const PlainList = ({
  items,
}: {
  items: { title: string; body: ReactNode }[];
}) => (
  <ul className="flex flex-col gap-3">
    {items.map((item) => (
      <li
        key={item.title}
        className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3"
      >
        <p className="text-[13px] font-medium text-primary">{item.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-secondary">
          {item.body}
        </p>
      </li>
    ))}
  </ul>
);

const Steps = ({ steps }: { steps: { title: string; body: string }[] }) => (
  <ol className="flex flex-col gap-3">
    {steps.map((step, index) => (
      <li
        key={step.title}
        className="flex gap-3 rounded-md border-[0.5px] border-border bg-card px-3.5 py-3"
      >
        <span
          aria-hidden
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[12px] font-medium text-accent"
        >
          {index + 1}
        </span>
        <div>
          <p className="text-[13px] font-medium text-primary">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-secondary">
            {step.body}
          </p>
        </div>
      </li>
    ))}
  </ol>
);

export function DocsContent() {
  return (
    <DocsShell>
      <div className="flex flex-col gap-8 sm:gap-14">
        <header
          id="introduction"
          className="scroll-mt-28 flex flex-col gap-3 border-b-[0.5px] border-border pb-6 sm:pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
            Documentation · itzsa
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            Page Builder
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            A visual page builder for React apps. Authors drag blocks onto a
            canvas; your app saves structured JSON; visitors see the same page
            in Preview and on the live site.
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-secondary">
            This guide covers every host corner you will configure: show/hide,
            custom blocks, CSS, images (CDN / Base64 / URL), languages,
            feature flags, code panel, and editor theming — all scalable as
            your product grows.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/page-builder
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              React 18 / 19
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              Host-owned I/O
            </span>
          </div>
          <p className="pt-3">
            <Link
              href="/page-builder/create"
              className="inline-flex items-center rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-fg no-underline"
              aria-label="Open live page builder demo"
            >
              Try the live demo →
            </Link>
          </p>
        </header>

        <nav aria-label="Jump to" className="flex flex-wrap gap-2 lg:hidden">
          {DOC_NAV.filter((n) => !n.indent).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1 text-xs text-secondary hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <DocSection
          id="how-it-works"
          title="How it works"
          description="Three rules keep canvas, preview, and live page aligned."
        >
          <PlainList
            items={[
              {
                title: "Blocks",
                body: "Every piece on the page is a block (heading, button, image, layout). Blocks can nest inside containers.",
              },
              {
                title: "One JSON document",
                body: "You save Page JSON — not a one-off HTML file. Re-open, translate, and version the same document.",
              },
              {
                title: "One render path",
                body: "Canvas, Preview, and Open Page all draw through the same React render for each block type.",
              },
            ]}
          />
          <Callout title="Host vs package">
            The package is the editor + renderer. Your app owns saving, auth,
            uploads, CDNs, and which toolbar buttons exist (including Code).
          </Callout>
        </DocSection>

        <DocSection
          id="installation"
          title="Install"
          description="Add the package to a React 18 or 19 project."
        >
          <InstallCommand packages={["@itzsa/page-builder"]} />
          <CodeBlock
            code={`import "@itzsa/page-builder/styles.css";`}
            language="ts"
          />
          <Callout title="Two kinds of CSS">
            Package CSS styles the <em>editor panels</em> (sidebar, toolbar).
            Page look comes from author CSS — see{" "}
            <a href="#author-css" className="text-accent underline-offset-2 hover:underline">
              Format page CSS
            </a>
            .
          </Callout>
        </DocSection>

        <DocSection
          id="quick-start"
          title="Your first editor"
          description="Register primitives, keep page in state, mount PageBuilder."
        >
          <CodeBlock code={STARTER} language="tsx" />
        </DocSection>

        <DocSection
          id="data-model"
          title="How a page is stored"
          description="Default: every block is visible. Visibility is opt-in."
        >
          <PlainList
            items={[
              {
                title: "Page",
                body: "Root document: blocks[], meta, optional globalCss / globalJs, schemaVersion, revision.",
              },
              {
                title: "Block",
                body: "One piece: id, type, props, optional i18nProps, children, customCss, visibility.",
              },
              {
                title: "Block definition",
                body: "Lives in the registry (not in saved JSON). Defines palette label, fields, and React render.",
              },
            ]}
          />
        </DocSection>

        <DocSection
          id="visibility"
          title="Show or hide blocks"
          description="By default every block is shown everywhere. Hide only when you set rules."
        >
          <Callout title="Default = shown">
            If you omit <code className="font-mono">visibility</code> and{" "}
            <code className="font-mono">visibleWhen</code>, the block appears
            on canvas, in Preview, and on the live page for every device and
            locale.
          </Callout>
          <PlainList
            items={[
              {
                title: "hiddenDevices",
                body: 'Hide on "desktop" | "tablet" | "mobile". Your app passes renderContext.device.',
              },
              {
                title: "hiddenLocales",
                body: 'Hide for locale codes (e.g. ["ne"]). Active locale comes from renderContext.locale.',
              },
              {
                title: "hiddenOnPublish",
                body: "Still visible while editing; omitted from Preview / Open Page.",
              },
              {
                title: "hiddenOnCanvas",
                body: "Ghosted in the editor (dimmed) so authors know it exists but it is not page content on canvas.",
              },
              {
                title: "visibleWhen",
                body: "Conditional rules against renderContext — e.g. auth.isLoggedIn, flags.promo, date ranges.",
              },
            ]}
          />
          <p className="text-sm font-medium text-primary">Examples</p>
          <CodeBlock code={VISIBILITY_EXAMPLE} language="json" />
          <Steps
            steps={[
              {
                title: "Author sets rules in Advanced inspector",
                body: "Or your host sets visibility on the block when applying a template.",
              },
              {
                title: "Host injects renderContext",
                body: "Pass device, locale, auth, flags into PageBuilder / RenderPage — the engine never fetches auth itself.",
              },
              {
                title: "Surfaces agree",
                body: "Canvas may ghost; Preview and Open Page hide. Same JSON + context → same decision.",
              },
            ]}
          />
        </DocSection>

        <DocSection
          id="register-blocks"
          title="Register new blocks"
          description="Required when you need a type the primitives don’t cover. Namespace + schema + React render."
        >
          <Steps
            steps={[
              {
                title: "Pick a namespaced type",
                body: 'Non-core types must be "tenant:…" or "plugin:vendor.name". Bare names (heading, button) are reserved for core.',
              },
              {
                title: "Define BlockDefinition",
                body: "label, category, defaultProps, propsSchema (Zod), render, ContentFields, translatableProps.",
              },
              {
                title: "Register after primitives",
                body: "createRegistry → registerPrimitives → registerBlock. Duplicate types throw (no silent override).",
              },
              {
                title: "Gate with capabilities",
                body: "allowRegisterTenantBlocks / allowRegisterPluginBlocks must not be false for that source.",
              },
            ]}
          />
          <CodeBlock code={REGISTER_BLOCK} language="tsx" />
          <Callout title="Security">
            <code className="font-mono">render</code> ships in your bundle.
            Never load unsigned remote scripts. For JSON-driven tenant widgets
            without a custom render, see{" "}
            <a href="#model-b" className="text-accent underline-offset-2 hover:underline">
              Model B
            </a>
            .
          </Callout>
        </DocSection>

        <DocSection
          id="author-css"
          title="Format page CSS"
          description="You own the look. Write normal CSS; the engine scopes and sanitizes it."
        >
          <PlainList
            items={[
              {
                title: "Page.globalCss",
                body: "Site-wide fonts, colors, type scale. Targets [data-pb-page], [data-block-type], etc.",
              },
              {
                title: "Block.customCss",
                body: "Per-block rules. The composer scopes them to [data-block-id=\"…\"] so styles don’t leak.",
              },
              {
                title: "@media queries",
                body: "Allowed — use them for responsive design.",
              },
              {
                title: "Rejected",
                body: "@import and most remote url(http…) values are blocked. Re-validate on the server when saving.",
              },
            ]}
          />
          <CodeBlock code={CSS_EXAMPLES} language="css" />
          <Callout title="Turn CSS editing off">
            Set <code className="font-mono">capabilities.allowCustomCss: false</code>{" "}
            to hide Advanced CSS in the inspector. Still reject CSS on your API
            if the client is untrusted.
          </Callout>
        </DocSection>

        <DocSection
          id="images"
          title="Images & media"
          description="The image block stores one string: props.src. How you produce that string is up to your host — scalable to many strategies."
        >
          <Callout title="Engine contract">
            <code className="font-mono">&lt;img src=&#123;props.src&#125; /&gt;</code>.
            CDN, Base64, or any URL all work because they are just strings. Pick
            the strategy per environment or file size.
          </Callout>
          <div className="overflow-x-auto rounded-md border-[0.5px] border-border bg-card">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-border">
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    Strategy
                  </th>
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    When to use
                  </th>
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    What gets saved
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "CDN / object storage",
                    "Production pages, large photos, shared assets",
                    "https://cdn…/file.webp",
                  ],
                  [
                    "Public URL",
                    "Existing media library, remote images",
                    "https://… or /media/…",
                  ],
                  [
                    "Base64 data URI",
                    "Tiny icons, offline demos, quick paste",
                    "data:image/png;base64,…",
                  ],
                ].map(([a, b, c]) => (
                  <tr
                    key={a}
                    className="border-b-[0.5px] border-border last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium text-primary">{a}</td>
                    <td className="px-3 py-2.5 text-secondary">{b}</td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-secondary">
                      {c}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Steps
            steps={[
              {
                title: "Author picks / uploads an image",
                body: "Built-in field is a text src today; your host can add a file picker that calls your upload API.",
              },
              {
                title: "Host uploads (optional)",
                body: "POST to your /api/upload → CDN returns a URL. Or FileReader → Base64. Or paste a URL.",
              },
              {
                title: "Write props.src",
                body: "updateBlock (or inspector onChange) sets props.src. That string is what Preview and Open Page use.",
              },
            ]}
          />
          <CodeBlock code={IMAGE_HOST} language="ts" />
          <Callout title="Scalable tip">
            Prefer CDN URLs in saved JSON. Base64 bloats documents and caches
            poorly. Keep Base64 for small assets or temporary drafts, then
            upgrade to CDN on publish if you want.
          </Callout>
        </DocSection>

        <DocSection
          id="locales"
          title="Languages"
          description="localeConfig is fully dynamic: English only, Nepali only, or as many languages as you need."
        >
          <p className="text-sm leading-relaxed text-secondary">
            The toolbar language switcher lists whatever you put in{" "}
            <code className="font-mono text-primary">localeConfig.locales</code>.
            Translatable text lives under{" "}
            <code className="font-mono text-primary">i18nProps[code]</code>.
            Shared settings (link href, heading level) stay in{" "}
            <code className="font-mono text-primary">props</code>.
          </p>
          <p className="text-sm font-medium text-primary">English only</p>
          <CodeBlock code={LOCALES_EN_ONLY} language="ts" />
          <p className="text-sm font-medium text-primary">Nepali only</p>
          <CodeBlock code={LOCALES_NE_ONLY} language="ts" />
          <p className="text-sm font-medium text-primary">
            Multiple languages (add Hindi, etc.)
          </p>
          <CodeBlock code={LOCALES_MULTI} language="ts" />
          <Callout title="Default helper">
            <code className="font-mono">createDefaultLocaleConfig()</code>{" "}
            ships English + Nepali. Replace it with your own config whenever
            the product needs a different set — no engine change required.
          </Callout>
        </DocSection>

        <DocSection
          id="capabilities"
          title="Turn features on/off"
          description="Disable custom JS, custom CSS, registration, or data binding per host, plan, or role."
        >
          <p className="text-sm leading-relaxed text-secondary">
            Defaults are <strong className="font-medium text-primary">allow</strong>{" "}
            (existing hosts keep working). Set a key to{" "}
            <code className="font-mono text-primary">false</code> to gate it.
          </p>
          <CodeBlock code={CAPABILITIES} language="ts" />
          <div className="overflow-x-auto rounded-md border-[0.5px] border-border bg-card">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-border">
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    Flag
                  </th>
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    What false does
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["allowCustomCss", "Hides Advanced CSS; composers skip author CSS."],
                  ["allowCustomJs", "Hides Custom JS panels; scripts not applied."],
                  ["allowDataBinding", "Repeater expansion / {{item.*}} disabled."],
                  [
                    "allowRegisterTenantBlocks",
                    "registerBlock with source tenant is rejected.",
                  ],
                  [
                    "allowRegisterPluginBlocks",
                    "registerBlock with source plugin is rejected.",
                  ],
                  [
                    "allowDynamicBlockDefs",
                    "Model B dynamic specs gated at registration.",
                  ],
                ].map(([name, desc]) => (
                  <tr
                    key={name}
                    className="border-b-[0.5px] border-border last:border-0"
                  >
                    <td className="px-3 py-2.5 align-top font-mono text-[12px] text-accent">
                      {name}
                    </td>
                    <td className="px-3 py-2.5 text-secondary">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout title="Defense in depth">
            UI gates are not enough. Re-check the same flags on your save /
            publish API.
          </Callout>
        </DocSection>

        <DocSection
          id="host-ui"
          title="Hide code & host UI"
          description="The Code / HTML panel is your chrome. Hide it with a host feature flag — the package does not force it."
        >
          <p className="text-sm leading-relaxed text-secondary">
            On this site’s create route, Code lives in the host header. Other
            hosts can omit it entirely. Keep a small features object so product
            tiers stay scalable.
          </p>
          <CodeBlock code={HOST_UI} language="tsx" />
          <PlainList
            items={[
              {
                title: "showCodePanel: false",
                body: "No Code button, no HTML/JSON modal. Authors stay in visual mode only.",
              },
              {
                title: "Same pattern for other buttons",
                body: "Publish, Open Page, Custom JS entry points — all host-owned. Gate them the same way.",
              },
            ]}
          />
        </DocSection>

        <DocSection
          id="editor-theme"
          title="Theme the editor panels"
          description="Restyle sidebar, toolbar, and inspector with CSS variables and panel classes — without touching page look."
        >
          <p className="text-sm leading-relaxed text-secondary">
            Editor chrome uses{" "}
            <code className="font-mono text-primary">--pb-*</code> tokens and
            classes such as{" "}
            <code className="font-mono text-primary">.pb-root</code>,{" "}
            <code className="font-mono text-primary">.pb-sidebar</code>,{" "}
            <code className="font-mono text-primary">.pb-toolbar</code>. Override
            them in your host stylesheet after importing package styles.
          </p>
          <CodeBlock code={EDITOR_THEME} language="css" />
          <Callout title="Important boundary">
            Theming panels does <strong className="font-medium text-primary">not</strong>{" "}
            style the published page. Page look stays in{" "}
            <code className="font-mono">globalCss</code> /{" "}
            <code className="font-mono">customCss</code>.
          </Callout>
        </DocSection>

        <DocSection
          id="render-parity"
          title="Same look everywhere"
          description="Same JSON + author CSS + locale + renderContext → canvas matches Preview matches Open Page."
        >
          <PlainList
            items={[
              {
                title: "No decorative engine skins",
                body: "Empty blocks look empty until you add author CSS — by design.",
              },
              {
                title: "Chrome stays outside the page",
                body: "Selection rings and toolbars are parent overlays, never part of published HTML.",
              },
              {
                title: "Safe preview URLs",
                body: "Preview links carry an opaque id only — never the full page JSON.",
              },
            ]}
          />
        </DocSection>

        <DocSection
          id="page-builder-api"
          title="Editor settings (API)"
          description="Main props on PageBuilder."
        >
          <PropsTable rows={PAGE_BUILDER_PROPS} caption="PageBuilder props" />
        </DocSection>

        <DocSection
          id="host-callbacks"
          title="What your app must do"
          description="Inject save, preview, data, and uploads. The engine never imports your services."
        >
          <PropsTable rows={HOST_CALLBACKS} caption="Host responsibilities" />
        </DocSection>

        <DocSection
          id="presets"
          title="Ready-made layouts"
          description="Card and Hero insert nested primitives — editable after drop."
        >
          <CodeBlock
            code={`import { listPresets, getPreset } from "@itzsa/page-builder";
listPresets();
getPreset("hero")?.create();`}
            language="ts"
          />
        </DocSection>

        <DocSection
          id="data-binding"
          title="Lists from your data"
          description="Repeater + {{item.*}} + fetchDataSource (or SSR dataSources)."
        >
          <CodeBlock
            code={`fetchDataSource: async (sourceId) => {
  const items = await api.list(sourceId);
  return { items };
}`}
            language="ts"
          />
        </DocSection>

        <DocSection
          id="model-b"
          title="Custom widgets (Model B)"
          description="JSON specs + field adapters for tenant widgets without eval."
        >
          <p className="text-sm leading-relaxed text-secondary">
            Use{" "}
            <code className="font-mono text-primary">registerDynamicBlock</code>{" "}
            when tenants need configurable widgets without shipping arbitrary
            remote JavaScript. Gate with{" "}
            <code className="font-mono text-primary">allowDynamicBlockDefs</code>.
          </p>
        </DocSection>

        <DocSection
          id="glossary"
          title="Glossary"
          description="Quick definitions."
        >
          <div className="overflow-x-auto rounded-md border-[0.5px] border-border bg-card">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-border">
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    Term
                  </th>
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Visibility", "Rules that show/hide a block. Default = shown."],
                  ["Registry", "Catalog of block types your editor allows."],
                  ["Capabilities", "Feature flags for CSS/JS/registration/binding."],
                  ["localeConfig", "Which languages exist and which is default."],
                  ["props.src", "Image source string (CDN, URL, or Base64)."],
                  ["Host UI", "Your toolbar (Code, Publish) — not package chrome."],
                  ["--pb-*", "CSS variables for theming editor panels."],
                  ["Render parity", "Editor === Preview === live page for same inputs."],
                ].map(([term, meaning]) => (
                  <tr
                    key={term}
                    className="border-b-[0.5px] border-border last:border-0"
                  >
                    <td className="px-3 py-2.5 align-top font-mono text-[12.5px] text-accent">
                      {term}
                    </td>
                    <td className="px-3 py-2.5 text-[13px] leading-relaxed text-secondary">
                      {meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocSection>

        <DocSection
          id="guides"
          title="Next steps"
          description="Try the demo, then wire the corners your product needs."
        >
          <PlainList
            items={[
              {
                title: "Try it",
                body: (
                  <>
                    <Link
                      href="/page-builder/create"
                      className="text-accent underline-offset-2 hover:underline"
                    >
                      Open the live demo
                    </Link>{" "}
                    — drag blocks, toggle Advanced visibility, edit CSS.
                  </>
                ),
              },
              {
                title: "Product checklist",
                body: "Locales → capabilities → image upload strategy → hide Code if needed → theme --pb-* → register tenant blocks.",
              },
              {
                title: "Repo docs",
                body: "Deeper topic files live under docs/page-builder/ in the monorepo.",
              },
            ]}
          />
          <p className="pt-2">
            <Link
              href="/page-builder/create"
              className="inline-flex items-center rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-fg no-underline"
              aria-label="Open live page builder demo"
            >
              Try the live demo →
            </Link>
          </p>
        </DocSection>
      </div>
    </DocsShell>
  );
}
