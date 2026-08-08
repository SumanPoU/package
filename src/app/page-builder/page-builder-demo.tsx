"use client";

import {
  buildPreviewUrl,
  createBlockId,
  createDefaultLocaleConfig,
  createPreviewSession,
  createRegistry,
  PAGE_SCHEMA_VERSION,
  type Page,
  PageBuilder,
  registerPrimitives,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const localeConfig = createDefaultLocaleConfig();

const createDemoPage = (): Page => {
  const headingId = createBlockId();
  const textId = createBlockId();
  const buttonId = createBlockId();
  const boxId = createBlockId();

  return {
    id: "demo-page",
    schemaVersion: PAGE_SCHEMA_VERSION,
    revision: "1",
    meta: { title: "Page Builder Demo" },
    globalCss: `
[data-pb-page] {
  font-family: Georgia, "Noto Sans Devanagari", serif;
  color: #1c1917;
  padding: 2rem;
  max-width: 42rem;
}
[data-block-type="heading"] {
  margin: 0 0 0.75rem;
  font-size: 2rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
[data-block-type="text"] {
  margin: 0 0 1.25rem;
  line-height: 1.6;
  color: #44403c;
}
[data-block-type="button"] {
  display: inline-block;
  padding: 0.55rem 1rem;
  border: 1px solid #1c1917;
  background: #1c1917;
  color: #fafaf9;
  text-decoration: none;
  font: inherit;
}
[data-block-type="box"] {
  display: block;
}
`,
    blocks: [
      {
        id: boxId,
        type: "box",
        props: { as: "section" },
        children: [
          {
            id: headingId,
            type: "heading",
            props: { level: "h1" },
            i18nProps: {
              en: { title: "Build pages visually" },
              ne: { title: "पृष्ठ दृश्यात्मक रूपमा बनाउनुहोस्" },
            },
          },
          {
            id: textId,
            type: "text",
            props: {},
            i18nProps: {
              en: {
                body: "Drag primitives from the left, edit content on the right, switch locale in the toolbar, then open Preview.",
              },
              ne: {
                body: "बायाँबाट तत्व थप्नुहोस्, दायाँबाट सामग्री सम्पादन गर्नुहोस्, टुलबारबाट भाषा बदल्नुहोस्, अनि पूर्वावलोकन खोल्नुहोस्।",
              },
            },
          },
          {
            id: buttonId,
            type: "button",
            props: { href: "#", openInNewTab: false },
            i18nProps: {
              en: { label: "Get started" },
              ne: { label: "सुरु गर्नुहोस्" },
            },
          },
        ],
      },
    ],
  };
};

export function PageBuilderDemo() {
  const router = useRouter();
  const registry = useMemo(() => {
    const r = createRegistry();
    registerPrimitives(r);
    return r;
  }, []);

  const [page, setPage] = useState<Page>(createDemoPage);
  const [activeLocale, setActiveLocale] = useState(localeConfig.defaultLocale);
  const [status, setStatus] = useState<string | null>(null);

  const handlePreview = async (next: Page) => {
    const session = await createPreviewSession({
      page: next,
      activeLocale,
      store: "sessionStorage",
    });
    const url = buildPreviewUrl("/page-builder/preview", session.id);
    router.push(url);
  };

  const handleOpenPage = async (next: Page) => {
    const session = await createPreviewSession({
      page: next,
      activeLocale,
      store: "sessionStorage",
      meta: { surface: "open" },
    });
    router.push(buildPreviewUrl("/page-builder/open", session.id, "page"));
  };

  const handleSave = (next: Page) => {
    setPage({
      ...next,
      revision: String(Number(next.revision ?? "0") + 1),
    });
    setStatus(`Saved (revision ${Number(next.revision ?? "0") + 1})`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-secondary">
        <span>
          Live editor · same <code className="text-primary">RenderPage</code> as
          Preview / Open Page
        </span>
        {status ? <span className="text-accent">{status}</span> : null}
        <a
          className="text-accent underline-offset-2 hover:underline"
          href="/page-builder/preview"
        >
          Preview route
        </a>
      </div>
      <div className="min-h-[640px]">
        <PageBuilder
          page={page}
          onChange={setPage}
          localeConfig={localeConfig}
          registry={registry}
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          onSave={handleSave}
          onPreview={handlePreview}
          onOpenPage={handleOpenPage}
          capabilities={{ allowCustomCss: true, allowCustomJs: false }}
        />
      </div>
    </div>
  );
}
