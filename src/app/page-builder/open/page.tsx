"use client";

import {
  createDefaultLocaleConfig,
  createRegistry,
  getPreviewIdFromUrl,
  loadPreviewSession,
  OpenPageView,
  type Page,
  registerPrimitives,
} from "@itzsa/page-builder";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const localeConfig = createDefaultLocaleConfig();

export default function PageBuilderOpenPage() {
  const registry = useMemo(() => {
    const r = createRegistry();
    registerPrimitives(r);
    return r;
  }, []);

  const [page, setPage] = useState<Page | null>(null);
  const [activeLocale, setActiveLocale] = useState(localeConfig.defaultLocale);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id =
      getPreviewIdFromUrl(window.location.href, "page") ??
      getPreviewIdFromUrl(window.location.href, "preview");
    if (!id) {
      setError("Missing page id — use Open Page from the editor.");
      return;
    }
    void loadPreviewSession(id).then((session) => {
      if (!session) {
        setError("Page session not found.");
        return;
      }
      setPage(session.page as Page);
      setActiveLocale(session.activeLocale);
    });
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-medium text-primary">Open Page</h1>
        <Link
          href="/page-builder"
          className="text-sm text-accent underline-offset-2 hover:underline"
        >
          Back to editor
        </Link>
      </div>
      {error ? <p className="text-sm text-secondary">{error}</p> : null}
      {page ? (
        <OpenPageView
          page={page}
          registry={registry}
          localeConfig={localeConfig}
          activeLocale={activeLocale}
          renderContext={{ locale: activeLocale, device: "desktop" }}
        />
      ) : !error ? (
        <p className="text-sm text-secondary">Loading…</p>
      ) : null}
    </main>
  );
}
