"use client";

import {
  createDefaultLocaleConfig,
  createRegistry,
  getPreviewIdFromUrl,
  loadPreviewSession,
  OpenPageView,
  type Page,
  registerDynamicBlock,
  registerPrimitives,
} from "@itzsa/page-builder";
import { useEffect, useMemo, useState } from "react";
import { DEMO_PROMO_SPEC } from "../demo-promo-spec";
import { SAMPLE_DATA_SOURCES } from "../sample-data-sources";

const localeConfig = createDefaultLocaleConfig();

export default function PageBuilderPreviewPage() {
  const registry = useMemo(() => {
    const r = createRegistry();
    registerPrimitives(r);
    registerDynamicBlock(r, DEMO_PROMO_SPEC);
    return r;
  }, []);

  const [page, setPage] = useState<Page | null>(null);
  const [activeLocale, setActiveLocale] = useState(localeConfig.defaultLocale);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getPreviewIdFromUrl(window.location.href, "preview");
    if (!id) {
      setError("Missing preview id in URL (open Preview from the editor).");
      return;
    }
    void loadPreviewSession(id).then((session) => {
      if (!session) {
        setError("Preview session not found (expired or different tab).");
        return;
      }
      setPage(session.page as Page);
      setActiveLocale(session.activeLocale);
    });
  }, []);

  const renderContext = useMemo(
    () => ({
      locale: activeLocale,
      device: "desktop" as const,
      dataSources: SAMPLE_DATA_SOURCES,
    }),
    [activeLocale],
  );

  return (
    <main className="mx-auto flex w-full  flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
      {error ? <p className="text-sm text-secondary">{error}</p> : null}
      {page ? (
        <OpenPageView
          page={page}
          registry={registry}
          localeConfig={localeConfig}
          activeLocale={activeLocale}
          renderContext={renderContext}
        />
      ) : !error ? (
        <p className="text-sm text-secondary">Loading preview…</p>
      ) : null}
    </main>
  );
}
