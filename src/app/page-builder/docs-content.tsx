"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { InstallCommand } from "@/components/install-command";
import {
  BACKGROUND_EXAMPLE,
  CANVAS_MODE_EXAMPLE,
  CAPABILITIES_EXAMPLE,
  CSS_EXAMPLE,
  ADD_LOCALE_EXAMPLE,
  BLOG_CARD_TREE_EXAMPLE,
  DATA_BINDING_EXAMPLE,
  DATA_MODEL_EXAMPLE,
  DYNAMIC_BLOCK_EXAMPLE,
  EDITOR_EXAMPLE,
  FEATURES_TABLE,
  FLEX_GRID_EXAMPLE,
  HOST_CHROME_EXAMPLE,
  INSTALL_CSS,
  LOCALES_EXAMPLE,
  PALETTE_CONFIG_EXAMPLE,
  PREVIEW_ROUTE_EXAMPLE,
  PUBLIC_PAGE_EXAMPLE,
  REGISTER_BLOCK_EXAMPLE,
  RENDER_PAGE_EXAMPLE,
  SAVE_TO_BACKEND_EXAMPLE,
  THEME_EXAMPLE,
  TYPOGRAPHY_EXAMPLE,
  UPLOAD_EXAMPLE,
  VALIDATE_EXAMPLE,
  VISIBILITY_EXAMPLE,
} from "./docs-examples";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  FeaturesTable,
  PropsTable,
  type PropRow,
} from "./docs-ui";

const PAGE_BUILDER_PROPS: PropRow[] = [
  {
    name: "page",
    type: "Page",
    description: "Current page document (controlled).",
  },
  {
    name: "onChange",
    type: "(page: Page) => void",
    description: "Called whenever the tree changes (history-aware edits).",
  },
  {
    name: "registry",
    type: "BlockRegistry",
    description: "Live block definition map from createRegistry().",
  },
  {
    name: "localeConfig",
    type: "LocaleConfig",
    description: "Host locale list + default (see Localization).",
  },
  {
    name: "activeLocale",
    type: "string",
    description: "Locale used for i18nProps resolution and inspector fields.",
  },
  {
    name: "onActiveLocaleChange",
    type: "(locale: string) => void",
    description: "Locale switcher callback.",
  },
  {
    name: "onSave",
    type: "(page, { expectedRevision? }) => void | Promise",
    description: "Persist Page JSON. Pass expectedRevision for optimistic concurrency.",
  },
  {
    name: "onPreview",
    type: "(page: Page) => void | Promise",
    description: "Open preview with the same page JSON (opaque id preferred).",
  },
  {
    name: "onOpenPage",
    type: "(page: Page) => void | Promise",
    description: "Open published / live view.",
  },
  {
    name: "capabilities",
    type: "PageBuilderCapabilities",
    description: "Gate CSS, JS, registration, data binding (explicit false disables).",
  },
  {
    name: "uploadAsset",
    type: "(file: File) => Promise<{ url: string }>",
    description: "CDN / media upload for Image Upload. Falls back to Base64 if omitted.",
  },
  {
    name: "fetchDataSource",
    type: "FetchDataSource",
    description: "Load repeater / binding items by source id.",
  },
  {
    name: "renderContext",
    type: "Partial<RenderContext>",
    description: "Device, publish flags, auth keys for visibility predicates.",
  },
  {
    name: "features",
    type: "PageBuilderUiFeatures",
    description: "showSave / showPreview / showOpenPage for package toolbar.",
  },
  {
    name: "canvasMode",
    type: '"embedded" | "iframe"',
    default: '"embedded"',
    description: "embedded = DnD canvas; iframe = sandboxed shell at canvasSrc.",
  },
  {
    name: "canvasSrc",
    type: "string",
    description: "Required when canvasMode is iframe (e.g. /page-builder/canvas).",
  },
  {
    name: "selectedId",
    type: "string | null",
    description: "Optional controlled selection.",
  },
  {
    name: "title",
    type: "string",
    default: '"Page builder"',
    description: "Editor chrome title.",
  },
];

const RENDER_PAGE_PROPS: PropRow[] = [
  {
    name: "page",
    type: "Page",
    description: "Same document the editor saves.",
  },
  {
    name: "registry",
    type: "BlockRegistry",
    description: "Must include every block type on the page.",
  },
  {
    name: "localeConfig / activeLocale",
    type: "LocaleConfig / string",
    description: "Resolve i18nProps for the active locale.",
  },
  {
    name: "surface",
    type: '"canvas" | "preview" | "open"',
    default: '"open"',
    description: "Affects visibility (e.g. hiddenOnPublish).",
  },
  {
    name: "capabilities / fetchDataSource / renderContext",
    type: "…",
    description: "Same contracts as PageBuilder for parity.",
  },
];

const REGISTER_PROPS: PropRow[] = [
  {
    name: "type",
    type: "string",
    description: "Stable type id. Core primitives are unprefixed; tenant/plugin must be namespaced.",
  },
  {
    name: "label",
    type: "string",
    description: "Palette label.",
  },
  {
    name: "render",
    type: "(props: BlockRenderProps) => ReactNode",
    description: "One React component for canvas, preview, and open page.",
  },
  {
    name: "ContentFields",
    type: "Component",
    description: "Inspector content UI (block, locale, onChange).",
  },
  {
    name: "propsSchema",
    type: "ZodType",
    description: "Validates props / i18n keys.",
  },
  {
    name: "translatableProps / sharedProps",
    type: "string[]",
    description: "Which keys live in i18nProps vs shared props.",
  },
  {
    name: "source",
    type: '"core" | "tenant" | "plugin"',
    description: "Registration capability gates non-core sources.",
  },
];

const CAPABILITY_ROWS: PropRow[] = [
  {
    name: "allowCustomCss",
    type: "boolean",
    default: "true",
    description: "Author globalCss / block customCss. Set false to hide and ignore.",
  },
  {
    name: "allowCustomJs",
    type: "boolean",
    default: "true*",
    description: "Author page JS (prefer false in production until you need it).",
  },
  {
    name: "allowDataBinding",
    type: "boolean",
    default: "true",
    description: "Repeater + {{item.*}} and fetchDataSource.",
  },
  {
    name: "allowRegisterTenantBlocks",
    type: "boolean",
    default: "true",
    description: "registerBlock with source: tenant.",
  },
  {
    name: "allowRegisterPluginBlocks",
    type: "boolean",
    default: "true",
    description: "registerBlock with source: plugin.",
  },
  {
    name: "allowDynamicBlockDefs",
    type: "boolean",
    default: "true",
    description: "Model B registerDynamicBlock(s).",
  },
];

const P = ({ children }: { children: ReactNode }) => (
  <p className="max-w-2xl text-sm leading-relaxed text-secondary">{children}</p>
);

const Ul = ({ children }: { children: ReactNode }) => (
  <ul className="max-w-2xl list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-secondary">
    {children}
  </ul>
);

export function DocsContent() {
  return (
    <DocsShell>
      <div className="flex flex-col gap-10 sm:gap-14">
        {/* ── Introduction ─────────────────────────────────────────── */}
        <header
          id="introduction"
          className="scroll-mt-28 flex flex-col gap-4 border-b-[0.5px] border-border pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
            Documentation · @itzsa/page-builder
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            Introduction
          </h1>
          <P>
            <code className="pkg text-[13px]">@itzsa/page-builder</code> is a
            drag-and-drop visual page builder for React — the same class as
            Elementor, Webflow, or{" "}
            <a
              href="https://puckeditor.com/docs"
              className="text-accent underline-offset-2 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Puck
            </a>
            . Authors compose pages from registered blocks; you persist{" "}
            <strong className="font-medium text-primary">Page JSON</strong>, not
            a one-off HTML export.
          </P>
          <Callout title="You own the data">
            The engine never imports your <code>services/</code>,{" "}
            <code>store/</code>, or routes. Persistence, auth, uploads, and
            previews go through host callbacks (
            <code>onSave</code>, <code>uploadAsset</code>, …).
          </Callout>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/page-builder/create"
              className="inline-flex items-center rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-foreground no-underline transition-opacity hover:opacity-90"
            >
              Try the live demo →
            </Link>
            <a
              href="#getting-started"
              className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
            >
              Jump to getting started
            </a>
          </div>
          <div className="pt-2">
            <FeaturesTable rows={FEATURES_TABLE} />
          </div>
        </header>

        {/* ── Getting started ──────────────────────────────────────── */}
        <DocSection
          id="getting-started"
          title="Getting started"
          description="Install the package, mount the editor, then render the same Page JSON on the public site."
        >
          <P>
            Prefer a short path: register primitives → mount{" "}
            <code>PageBuilder</code> → save JSON → render with{" "}
            <code>RenderPage</code> / <code>OpenPageView</code>. Canvas, Preview,
            and Open Page share one React render path.
          </P>
        </DocSection>

        <DocSection
          id="install"
          title="Installation"
          level={3}
          description="Add the package and import editor chrome styles once in your app."
        >
          <InstallCommand packages="@itzsa/page-builder" />
          <P>
            Peer dependencies: <code>react</code>, <code>react-dom</code> (^18
            or ^19), and <code>zod</code>.
          </P>
          <CodeBlock code={INSTALL_CSS} language="tsx" />
        </DocSection>

        <DocSection
          id="render-editor"
          title="Render the editor"
          level={3}
          description="PageBuilder is a controlled component: you hold page state and persist on save."
        >
          <CodeBlock code={EDITOR_EXAMPLE} language="tsx" />
          <Callout title="Parity rule">
            If something is visible as page content in the canvas for the current{" "}
            <code>renderContext</code>, it must render identically in Preview and
            Open Page with the same JSON, author CSS, and locale.
          </Callout>
        </DocSection>

        <DocSection
          id="render-page"
          title="Render the page"
          level={3}
          description="Use the same registry and Page document outside the editor."
        >
          <CodeBlock code={RENDER_PAGE_EXAMPLE} language="tsx" />
          <Ul>
            <li>
              <code>RenderPage</code> — block tree only (embed in your layout).
            </li>
            <li>
              <code>OpenPageView</code> — also injects composed author CSS/JS
              when allowed. Prefer this on public / preview routes.
            </li>
          </Ul>
        </DocSection>

        <DocSection
          id="show-on-site"
          title="Show page on your site"
          level={3}
          description="End-to-end: save Page JSON from the editor → fetch it on another route → mount OpenPageView."
        >
          <P>
            The builder does not ship a “website.” After authors build a page,
            your app stores the JSON and your public frontend draws it with{" "}
            <code>OpenPageView</code> (or <code>RenderPage</code>). That is the
            component people see on the next page.
          </P>

          <h4 className="text-[14px] font-medium text-primary">
            1. Save to your backend
          </h4>
          <P>
            Persist the <code>Page</code> object from <code>onSave</code>. Do
            not rely on HTML as the source of truth.
          </P>
          <CodeBlock code={SAVE_TO_BACKEND_EXAMPLE} language="tsx" />

          <h4 className="text-[14px] font-medium text-primary">
            2. Preview on another route (before publish)
          </h4>
          <P>
            Demo pattern used at{" "}
            <Link
              href="/page-builder/create"
              className="text-accent underline-offset-2 hover:underline"
            >
              /page-builder/create
            </Link>
            : store a short-lived session, put only an opaque id in the URL,
            then load and render with <code>OpenPageView</code> on{" "}
            <code>/page-builder/preview</code>.
          </P>
          <CodeBlock code={PREVIEW_ROUTE_EXAMPLE} language="tsx" />
          <Callout title="Never put Page JSON in the URL">
            Multi-locale trees + CSS blow past URL length limits. Use{" "}
            <code>createPreviewSession</code> +{" "}
            <code>buildPreviewUrl</code>, or a draft API that returns an id.
          </Callout>

          <h4 className="text-[14px] font-medium text-primary">
            3. Public frontend — fetch JSON, show the page
          </h4>
          <P>
            After publish, your public route loads the saved document from your
            API and mounts <code>OpenPageView</code>. Use the{" "}
            <strong className="font-medium text-primary">same registry</strong>{" "}
            as the editor (primitives + every custom block type).
          </P>
          <CodeBlock code={PUBLIC_PAGE_EXAMPLE} language="tsx" />
          <Ul>
            <li>
              <code>OpenPageView</code> = the public renderer (CSS/JS composers
              + <code>RenderPage</code>).
            </li>
            <li>
              Registry mismatch → missing blocks fall back / blank — register
              everything the editor had.
            </li>
            <li>
              Same <code>localeConfig</code> + choose{" "}
              <code>activeLocale</code> from the request (cookie, path, query).
            </li>
            <li>
              Optional: pass <code>fetchDataSource</code> /{" "}
              <code>renderContext</code> so repeaters and visibility match the
              editor.
            </li>
          </Ul>
        </DocSection>

        {/* ── Integrating ──────────────────────────────────────────── */}
        <DocSection
          id="integrating"
          title="Integrating"
          description="Wire registry, locales, media, visibility, capabilities, and canvas into your host app."
        >
          <P>
            The sections below match how you typically integrate a visual
            editor: register blocks, understand the data model, then layer
            locales, CSS, uploads, and feature gates.
          </P>
        </DocSection>

        <DocSection
          id="component-config"
          title="Register blocks"
          level={3}
          description="Built-in primitives cover layout and content. Add tenant blocks with registerBlock (Model A) or JSON specs (Model B)."
        >
          <P>
            Call <code>registerPrimitives(registry)</code> for heading, text,
            image, button, box/flex/grid, spacer, divider, and repeater. Card /
            Hero presets expand to editable primitive trees — prefer composition
            over mega-widgets.
          </P>
          <CodeBlock code={REGISTER_BLOCK_EXAMPLE} language="tsx" />
          <Callout title="One render path">
            Never add a second HTML template or publish-only component for the
            same <code>type</code>. Canvas, Preview, and Open Page all mount{" "}
            <code>definition.render</code>.
          </Callout>
          <P>
            Built-ins: box/container, flex, grid, heading, text, list, badge,
            icon, image, video, button, divider, space, code, repeater, Google
            Map, embed/iframe, html.
          </P>
          <Callout title="Google Map & Embed">
            Paste the iframe HTML from Google Maps (Share → Embed) or any https
            iframe. The engine parses and stores only the <code>src</code> URL —
            never raw HTML with scripts.
          </Callout>
        </DocSection>

        <DocSection
          id="layout-blocks"
          title="Flex & Grid"
          level={3}
          description="Drop Flex or Grid on the canvas, then drag other blocks into the dashed drop zone inside."
        >
          <Ul>
            <li>
              Empty Flex/Grid shows <strong className="font-medium text-primary">Empty / Drop here</strong> — drop Heading, Text, Image, etc. into that zone.
            </li>
            <li>
              Content tab: Flex has direction, justify, align, gap, wrap; Grid
              has columns, gaps, align/justify items.
            </li>
            <li>
              Children are stored on <code>block.children</code> — same JSON for
              Preview and Open Page.
            </li>
          </Ul>
          <CodeBlock code={FLEX_GRID_EXAMPLE} language="json" />
        </DocSection>

        <DocSection
          id="data-model"
          title="Data model"
          level={3}
          description="The canonical saved document is structured Page JSON (schema-validated). Full HTML is an optional derived export."
        >
          <CodeBlock code={DATA_MODEL_EXAMPLE} language="json" />
          <Ul>
            <li>
              <code>props</code> — shared (non-translated) values.
            </li>
            <li>
              <code>i18nProps[locale]</code> — translated fields.
            </li>
            <li>
              <code>revision</code> — bump on save; use with{" "}
              <code>assertRevisionMatch</code> / <code>expectedRevision</code>.
            </li>
            <li>
              <code>globalCss</code> / block <code>customCss</code> — author
              look (not engine skins).
            </li>
          </Ul>
        </DocSection>

        <DocSection
          id="localization"
          title="Localization"
          level={3}
          description="Locales are host-configured. Flat host keys normalize through i18nResolve — never a hardcoded switch (lang)."
        >
          <CodeBlock code={LOCALES_EXAMPLE} language="tsx" />
          <P>
            Pass the same <code>localeConfig</code> into the editor and into{" "}
            <code>RenderPage</code>. Switch <code>activeLocale</code> to edit or
            view another language.
          </P>
        </DocSection>

        <DocSection
          id="author-css"
          title="Author CSS / JS"
          level={3}
          description="Page look comes from author CSS. The engine does not ship decorative block skins."
        >
          <CodeBlock code={CSS_EXAMPLE} language="css" />
          <Ul>
            <li>
              Target <code>[data-pb-page]</code>,{" "}
              <code>[data-block-type=&quot;…&quot;]</code>, or{" "}
              <code>.b-{"{blockId}"}</code>.
            </li>
            <li>
              Gate with <code>capabilities.allowCustomCss</code> /{" "}
              <code>allowCustomJs</code>.
            </li>
            <li>
              Re-validate on the server with{" "}
              <code>validateAuthorCode</code> before persist (see API).
            </li>
          </Ul>
        </DocSection>

        <DocSection
          id="images"
          title="Images & media"
          level={3}
          description="Image blocks: preview, URL + Upload (CDN or Base64), content width, alignment, link, alt."
        >
          <CodeBlock code={UPLOAD_EXAMPLE} language="tsx" />
          <Ul>
            <li>
              <strong className="font-medium text-primary">Upload</strong> —
              uses <code>uploadAsset</code> when provided; otherwise Base64
              (size-capped). Same control is reused for background images.
            </li>
            <li>
              Content width presets (full / large 1024 / medium / small /
              custom) plus left / center / right alignment and optional link.
            </li>
            <li>
              Also: <code>video</code> (YouTube / Vimeo / mp4) and{" "}
              <code>html</code> (sanitized allow-list).
            </li>
          </Ul>
        </DocSection>

        <DocSection
          id="background"
          title="Background"
          level={3}
          description="Style tab and Box/Flex/Grid Content: Background Type Color | Image, opacity, dark overlay."
        >
          <CodeBlock code={BACKGROUND_EXAMPLE} language="json" />
        </DocSection>

        <DocSection
          id="typography"
          title="Typography"
          level={3}
          description="Style tab — type font weight freely; letter-spacing uses value + unit like font size; pass host fonts."
        >
          <CodeBlock code={TYPOGRAPHY_EXAMPLE} language="tsx" />
          <P>
            When the active locale is Nepali (<code>ne</code>), the editor
            header shows / edits the Nepali page name (
            <code>meta.title_np</code>).
          </P>
        </DocSection>

        <DocSection
          id="visibility"
          title="Visibility"
          level={3}
          description="Default: omit visibility → the block is always shown as page content."
        >
          <CodeBlock code={VISIBILITY_EXAMPLE} language="json" />
          <P>
            Resolve with the same <code>renderContext</code> and{" "}
            <code>surface</code> in editor and published views so Preview matches
            Open Page.
          </P>
        </DocSection>

        <DocSection
          id="data-binding"
          title="Data sources"
          level={3}
          description="Repeater blocks load items from the host and bind template fields with {{item.key}}."
        >
          <CodeBlock code={DATA_BINDING_EXAMPLE} language="tsx" />
          <P>
            Requires <code>allowDataBinding</code> (default allowed). Disable it
            to hide repeater binding for a workspace.
          </P>
        </DocSection>

        <DocSection
          id="feature-toggling"
          title="Feature toggling"
          level={3}
          description="Two layers: package capabilities (security / product) and host UI flags (chrome)."
        >
          <CodeBlock code={CAPABILITIES_EXAMPLE} language="tsx" />
          <PropsTable rows={CAPABILITY_ROWS} caption="capabilities" />
          <P>
            Host chrome flags (demo create shell):
          </P>
          <CodeBlock code={HOST_CHROME_EXAMPLE} language="tsx" />
        </DocSection>

        <DocSection
          id="palette-config"
          title="Hide groups & blocks"
          level={3}
          description="Filter the elements palette by category and/or block type."
        >
          <CodeBlock code={PALETTE_CONFIG_EXAMPLE} language="tsx" />
        </DocSection>

        <DocSection
          id="viewports-canvas"
          title="Canvas & viewports"
          level={3}
          description="embedded mode enables same-document DnD. iframe mode sandboxes the page document (ADR-02)."
        >
          <CodeBlock code={CANVAS_MODE_EXAMPLE} language="tsx" />
          <Callout title="Editor chrome stays outside the page DOM">
            Selection outlines and drag ghosts are parent overlays — never
            injected into the published page document.
          </Callout>
        </DocSection>

        <DocSection
          id="theming"
          title="Theming the editor"
          level={3}
          description="Override --pb-* tokens on .pb-root / [data-pb-editor]. Do not use these to style published page content."
        >
          <CodeBlock code={THEME_EXAMPLE} language="css" />
        </DocSection>

        {/* ── API reference ────────────────────────────────────────── */}
        <DocSection
          id="api-reference"
          title="API reference"
          description="Primary exports for integrating and extending the builder."
        >
          <P>
            Deeper topic docs also live in the repo under{" "}
            <code>docs/page-builder/</code> and{" "}
            <code>ARCHITECTURE-PAGE-BUILDER.md</code>.
          </P>
        </DocSection>

        <DocSection id="api-page-builder" title="PageBuilder" level={3}>
          <PropsTable rows={PAGE_BUILDER_PROPS} caption="PageBuilderProps" />
        </DocSection>

        <DocSection
          id="api-render"
          title="RenderPage / OpenPageView"
          level={3}
        >
          <PropsTable rows={RENDER_PAGE_PROPS} caption="RenderPageProps (core)" />
          <P>
            <code>OpenPageView</code> adds <code>nonce</code>,{" "}
            <code>cssOptions</code>, and <code>injectAuthorCode</code> (default
            true) for publishing surfaces.
          </P>
        </DocSection>

        <DocSection id="api-register" title="registerBlock" level={3}>
          <PropsTable rows={REGISTER_PROPS} caption="BlockDefinition (key fields)" />
        </DocSection>

        <DocSection
          id="api-host"
          title="Host callbacks"
          level={3}
          description="Injected I/O — the engine never reaches into your app."
        >
          <Ul>
            <li>
              <code>onSave</code> — persist Page JSON (+ revision).
            </li>
            <li>
              <code>onPreview</code> / <code>onOpenPage</code> — navigate with an
              opaque id, not serialized JSON in the URL.
            </li>
            <li>
              <code>uploadAsset</code> — return a stable CDN URL.
            </li>
            <li>
              <code>fetchDataSource</code> —{" "}
              <code>(sourceId) =&gt; &#123; items &#125;</code>.
            </li>
          </Ul>
        </DocSection>

        <DocSection
          id="api-validate"
          title="validateAuthorCode"
          level={3}
          description="Parse author CSS/JS with the same composers used at render time. Call before save/publish."
        >
          <CodeBlock code={VALIDATE_EXAMPLE} language="tsx" />
        </DocSection>

        {/* ── Guides ───────────────────────────────────────────────── */}
        <DocSection
          id="guides"
          title="Guides"
          description="Longer how-tos for blocks, data, locales, CSS/JS, and parity. End-to-end save → public render is covered in Getting started (Show page on your site)."
        >
          <div className="flex flex-wrap gap-3">
            <Link
              href="/page-builder/create"
              className="inline-flex items-center rounded-md border-[0.5px] border-border bg-card px-3.5 py-2 text-sm font-medium text-primary no-underline hover:border-accent hover:text-accent"
            >
              Open live demo
            </Link>
            <p className="self-center text-xs text-tertiary">MIT License</p>
          </div>
        </DocSection>

        <DocSection
          id="guide-add-block"
          title="Add a block"
          level={3}
          description="Add a core-style or host Model A block without forking the engine."
        >
          <Ul>
            <li>
              Define <code>BlockDefinition</code>: <code>type</code>,{" "}
              <code>label</code>, <code>category</code>,{" "}
              <code>defaultProps</code>, <code>propsSchema</code>,{" "}
              <code>render</code>, <code>ContentFields</code>.
            </li>
            <li>
              Declare <code>translatableProps</code> / <code>sharedProps</code>{" "}
              / <code>defaultI18nProps</code> for i18n.
            </li>
            <li>
              Register after primitives with <code>registerBlock</code>.
            </li>
            <li>
              <code>render</code> uses semantic HTML + author CSS only (no
              engine decorative skins).
            </li>
            <li>
              Mount <code>PageBuilder</code> / <code>RenderPage</code> with the
              same registry (parity).
            </li>
          </Ul>
          <CodeBlock code={REGISTER_BLOCK_EXAMPLE} language="tsx" />
          <Callout title="Checklist">
            Namespace non-core types (<code>tenant:</code> /{" "}
            <code>plugin:</code>). Duplicate <code>type</code> throws — no silent
            override. No <code>eval</code>. Unknown types still get{" "}
            <code>FallbackBlock</code>.
          </Callout>
        </DocSection>

        <DocSection
          id="guide-register-block"
          title="Register a custom block (Model A)"
          level={3}
          description="Tenants and plugins add block types by registering a bundled BlockDefinition — no remote eval."
        >
          <Ul>
            <li>
              Non-core types <strong className="font-medium text-primary">must</strong>{" "}
              be <code>tenant:…</code> or <code>plugin:vendor.block</code>.
            </li>
            <li>
              Cannot register <code>tenant:heading</code> — bare ids are reserved
              for core.
            </li>
            <li>
              Duplicate <code>type</code> throws. <code>render</code> ships in the
              host/plugin bundle.
            </li>
            <li>
              Missing type at render → <code>FallbackBlock</code> (tree-preserving
              placeholder).
            </li>
          </Ul>
          <CodeBlock code={REGISTER_BLOCK_EXAMPLE} language="tsx" />
          <P>
            Gate with <code>allowRegisterPluginBlocks</code> /{" "}
            <code>allowRegisterTenantBlocks</code> (default allow). Use{" "}
            <code>createPageSchema(&#123; registry &#125;)</code> so live registry
            refine accepts new types.
          </P>
        </DocSection>

        <DocSection
          id="guide-dynamic-blocks"
          title="Dynamic blocks (Model B)"
          level={3}
          description="JSON specs + a composition tree of existing primitives. No downloaded render JS, no eval."
        >
          <Ul>
            <li>
              Host fetches specs (<code>fetchDynamicBlocks</code> — host-owned).
            </li>
            <li>
              <code>registerDynamicBlock(s)</code> after{" "}
              <code>registerPrimitives</code>.
            </li>
            <li>
              Live registry <code>.refine()</code> accepts the new types.
            </li>
            <li>
              Template strings may use <code>&#123;&#123;props.fieldKey&#125;&#125;</code>{" "}
              (same one-pass rules as repeater <code>&#123;&#123;item.*&#125;&#125;</code>).
            </li>
          </Ul>
          <CodeBlock code={DYNAMIC_BLOCK_EXAMPLE} language="tsx" />
          <P>
            Reject with{" "}
            <code>
              registerDynamicBlock(registry, spec, &#123; allowDynamicBlockDefs:
              false &#125;)
            </code>
            .
          </P>
        </DocSection>

        <DocSection
          id="guide-blog-card"
          title="Dynamic blog card"
          level={3}
          description="CMS blog cards are a repeater + DataSource + primitive template — not a locked blog-card widget."
        >
          <CodeBlock code={BLOG_CARD_TREE_EXAMPLE} language="text" />
          <Ul>
            <li>
              Register DataSource metadata (<code>posts</code> +{" "}
              <code>itemSchema</code>).
            </li>
            <li>
              Strategy A: resolve into{" "}
              <code>renderContext.dataSources.posts</code> (SSR / Open Page).
            </li>
            <li>
              Strategy B: pass <code>fetchDataSource</code> for client fetch.
            </li>
            <li>
              <code>capabilities.allowDataBinding</code> must be allowed or
              binding is inert.
            </li>
            <li>
              Outline edits the <strong className="font-medium text-primary">template</strong>,
              not N clones. Tokens: <code>&#123;&#123;item.field&#125;&#125;</code> only.
            </li>
          </Ul>
          <CodeBlock code={DATA_BINDING_EXAMPLE} language="tsx" />
        </DocSection>

        <DocSection
          id="guide-locale"
          title="Add a locale"
          level={3}
          description="Locales are host-configured — no engine release to add hi, zh, etc."
        >
          <Ul>
            <li>
              Extend <code>LocaleConfig.locales</code> with{" "}
              <code>&#123; code, label, dir, flatSuffixes? &#125;</code>.
            </li>
            <li>
              Keep <code>defaultLocale</code> / <code>fallbackLocale</code> valid.
            </li>
            <li>
              Pass the same <code>localeConfig</code> into{" "}
              <code>PageBuilder</code> and <code>RenderPage</code>.
            </li>
            <li>
              Never hardcode <code>switch (lang)</code> in block{" "}
              <code>render</code> — use <code>i18nResolve</code>.
            </li>
          </Ul>
          <CodeBlock code={ADD_LOCALE_EXAMPLE} language="ts" />
        </DocSection>

        <DocSection
          id="guide-custom-css"
          title="Custom CSS / JS"
          level={3}
          description="Author code always passes through composers — never raw-injected."
        >
          <h4 className="text-[14px] font-medium text-primary">CSS</h4>
          <Ul>
            <li>
              Gate with <code>capabilities.allowCustomCss !== false</code>.
            </li>
            <li>
              Authors edit <code>Block.customCss</code> (Advanced) and/or{" "}
              <code>Page.globalCss</code>.
            </li>
            <li>
              Engine: parse → compose → inject with CSP nonce. Per-block rules
              scope to <code>[data-block-id=&quot;…&quot;]</code>.
            </li>
          </Ul>
          <CodeBlock code={CSS_EXAMPLE} language="css" />
          <h4 className="text-[14px] font-medium text-primary">JS</h4>
          <Ul>
            <li>
              Gate with <code>capabilities.allowCustomJs</code> (often off for
              low-trust tenants).
            </li>
            <li>
              Runs only in canvas iframe / Open Page — never the editor parent.
            </li>
            <li>
              Network default-deny; pass <code>allowedConnectOrigins</code> into
              sandbox CSP if needed.
            </li>
          </Ul>
          <Callout title="Do not">
            Skip nonces with <code>&apos;unsafe-inline&apos;</code>, put{" "}
            <code>allow-same-origin</code> on the canvas sandbox, or treat
            client composers as the authority — re-validate on the server with{" "}
            <code>validateAuthorCode</code>.
          </Callout>
          <CodeBlock code={VALIDATE_EXAMPLE} language="tsx" />
        </DocSection>

        <DocSection
          id="guide-render-parity"
          title="Render parity"
          level={3}
          description="For the same Page JSON + author CSS/JS + locale + renderContext: canvas === Preview === Open Page."
        >
          <Ul>
            <li>
              One React <code>render</code> per block type (registry). No second
              HTML template or publish-only component.
            </li>
            <li>
              Editor chrome (selection, drag ghosts, toolbars) lives in the{" "}
              <strong className="font-medium text-primary">parent</strong>{" "}
              document via overlays — never inside the page DOM.
            </li>
            <li>
              Engine must not ship decorative default skins so the canvas “looks
              less empty.”
            </li>
            <li>
              No <code>switch (block.type)</code> outside registry dispatch.
            </li>
          </Ul>
          <Callout title="Failure modes">
            Canvas styles Preview lacks → remove engine/demo CSS. Overlay chrome
            on Open Page → move to parent overlays. Locale differs per surface →
            same <code>i18nResolve</code> + <code>activeLocale</code> everywhere.
          </Callout>
        </DocSection>

        <DocSection
          id="guide-signed-import"
          title="Signed dynamic import (gated)"
          level={3}
          description="Phase 19 — not shipped. Do not implement or rely on this path in v1 / v1.x."
        >
          <Callout title="Hard forbid">
            Never <code>eval</code> / <code>new Function</code> of remote source.
            Never load unsigned remote script as <code>render</code>. Use Model A
            (bundled register) or Model B (JSON specs) instead.
          </Callout>
          <P>
            Future intent only: host-controlled URL, SRI / signature check, then{" "}
            <code>import(url)</code> of a vetted bundle — same iframe isolation.
            Until then, document capability needs in <code>capabilities</code>;
            never invent an eval escape hatch.
          </P>
        </DocSection>
      </div>
    </DocsShell>
  );
}
