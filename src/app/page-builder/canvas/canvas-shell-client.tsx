"use client";

import {
  CanvasDocument,
  createChildBridgeListener,
  createDefaultLocaleConfig,
  createRegistry,
  type LocaleConfig,
  PAGE_SCHEMA_VERSION,
  type Page,
  type RenderContext,
  registerPrimitives,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";
import { useEffect, useMemo, useState } from "react";

type SyncState = {
  page: Page;
  activeLocale: string;
  localeConfig: LocaleConfig;
  renderContext?: Partial<RenderContext>;
  selectedId?: string | null;
};

const emptyPage = (): Page => ({
  id: "canvas-shell",
  schemaVersion: PAGE_SCHEMA_VERSION,
  revision: "0",
  meta: { title: "Canvas" },
  blocks: [],
});

/**
 * Sandboxed canvas document shell — parent posts `page-sync` via canvasBridge.
 * Mounted at `/page-builder/canvas` and loaded inside CanvasFrame iframe.
 */
export function CanvasShellClient() {
  const registry = useMemo(() => {
    const r = createRegistry();
    registerPrimitives(r);
    return r;
  }, []);

  const [sync, setSync] = useState<SyncState>(() => ({
    page: emptyPage(),
    activeLocale: "en",
    localeConfig: createDefaultLocaleConfig(),
    selectedId: null,
  }));

  useEffect(() => {
    return createChildBridgeListener((message) => {
      if (message.type !== "page-sync") return;
      const payload = message.payload as Partial<SyncState>;
      if (!payload.page || !payload.localeConfig || !payload.activeLocale) {
        return;
      }
      setSync({
        page: payload.page as Page,
        activeLocale: payload.activeLocale,
        localeConfig: payload.localeConfig as LocaleConfig,
        renderContext: payload.renderContext,
        selectedId: payload.selectedId ?? null,
      });
    });
  }, []);

  return (
    <CanvasDocument
      page={sync.page}
      registry={registry}
      localeConfig={sync.localeConfig}
      activeLocale={sync.activeLocale}
      renderContext={sync.renderContext}
      selectedId={sync.selectedId}
      embedded={false}
    />
  );
}
