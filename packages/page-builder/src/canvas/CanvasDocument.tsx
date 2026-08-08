import { useEffect, useRef } from "react";
import type { CssParseOptions } from "../core/cssParser";
import { composePageCss } from "../core/customCssComposer";
import { composePageJs } from "../core/customJsComposer";
import type { BlockRegistry } from "../core/registry";
import type { LocaleConfig, Page } from "../core/types";
import type { RenderContext } from "../core/visibilityResolve";
import { RenderPage } from "../render/RenderPage";
import { type BridgeMeasurePayload, postToParent } from "./canvasBridge";
import { injectScriptElement } from "./injectScripts";
import { injectStyleElement } from "./injectStyles";

export type CanvasDocumentProps = {
  page: Page;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  renderContext?: Partial<RenderContext>;
  nonce?: string;
  cssOptions?: CssParseOptions;
  selectedId?: string | null;
  /** In-process editor canvas (no iframe). */
  embedded?: boolean;
  onSelect?: (blockId: string | null) => void;
  onMeasures?: (measures: Map<string, BridgeMeasurePayload["rect"]>) => void;
};

/**
 * Mounts inside the canvas iframe (or embedded wrap).
 * Applies composed author CSS/JS; reports measures via bridge / callbacks.
 * Does NOT draw selection outlines (parent SelectionOverlay only).
 */
export const CanvasDocument = ({
  page,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  nonce,
  cssOptions,
  selectedId = null,
  embedded = false,
  onSelect,
  onMeasures,
}: CanvasDocumentProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!embedded) {
      postToParent("ready", { frameId: page.id });
    }
  }, [page.id, embedded]);

  useEffect(() => {
    const doc = rootRef.current?.ownerDocument;
    if (!doc) return;

    const { css } = composePageCss(page, cssOptions);
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }
    if (css) {
      styleRef.current = injectStyleElement(doc, css, nonce);
    }

    const { scripts } = composePageJs(page, { nonce });
    for (const script of scripts) {
      injectScriptElement(doc, script.code, nonce);
    }

    return () => {
      styleRef.current?.remove();
      styleRef.current = null;
    };
  }, [page, nonce, cssOptions]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reportMeasures = () => {
      const map = new Map<string, BridgeMeasurePayload["rect"]>();
      const nodes = root.querySelectorAll<HTMLElement>("[data-block-id]");
      const rootRect = root.getBoundingClientRect();
      nodes.forEach((el) => {
        const blockId = el.getAttribute("data-block-id");
        if (!blockId) return;
        const rect = el.getBoundingClientRect();
        // Positions relative to canvas wrap for parent overlays.
        const payload = {
          top: rect.top - rootRect.top + root.scrollTop,
          left: rect.left - rootRect.left + root.scrollLeft,
          width: rect.width,
          height: rect.height,
        };
        map.set(blockId, payload);
        if (!embedded) {
          postToParent("measure", { blockId, rect: payload });
        }
      });
      if (embedded) onMeasures?.(map);
    };

    reportMeasures();
    const ro = new ResizeObserver(reportMeasures);
    ro.observe(root);
    window.addEventListener("scroll", reportMeasures, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", reportMeasures, true);
    };
  }, [page, selectedId, embedded, onMeasures]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const el = target?.closest?.("[data-block-id]");
      const blockId = el?.getAttribute("data-block-id") ?? null;
      if (embedded) onSelect?.(blockId);
      else postToParent("select", { blockId });
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [embedded, onSelect]);

  return (
    <div
      ref={rootRef}
      className="pb-canvas-embedded"
      data-pb-canvas-document=""
    >
      <RenderPage
        page={page}
        registry={registry}
        localeConfig={localeConfig}
        activeLocale={activeLocale}
        renderContext={renderContext}
        surface="canvas"
      />
    </div>
  );
};
