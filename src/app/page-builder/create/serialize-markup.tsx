"use client";

import {
  type Block,
  type BlockRegistry,
  collectBlockStyleCssRules,
  composePageCss,
  type LocaleConfig,
  type Page,
  RenderBlock,
  RenderPage,
} from "@itzsa/page-builder";
import type { ReactElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { formatCss, formatHtml, formatJson } from "./format-code";

const hasBlockMarkup = (html: string): boolean =>
  /data-block-id\s*=/.test(html);

/**
 * Sync client markup. Must run outside React render (e.g. useLayoutEffect) —
 * createRoot during useMemo returns empty under concurrent React.
 */
export const renderClientMarkup = (element: ReactElement): string => {
  if (typeof document === "undefined") return "";

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  // Keep a real layout box — zero-size hosts can yield empty commits in some
  // React 19 + compiler setups.
  host.style.cssText =
    "position:fixed;left:-99999px;top:0;width:800px;height:auto;overflow:hidden;pointer-events:none";
  document.body.appendChild(host);

  try {
    const root = createRoot(host);
    flushSync(() => {
      root.render(element);
    });
    const html = host.innerHTML;
    flushSync(() => {
      root.render(null);
    });
    root.unmount();
    return html;
  } finally {
    host.remove();
  }
};

const stripEditorChrome = (root: HTMLElement): HTMLElement => {
  const clone = root.cloneNode(true) as HTMLElement;
  clone.removeAttribute("class");
  clone.removeAttribute("data-dropzone");
  clone.removeAttribute("data-pb-device");
  clone.setAttribute("data-pb-surface", "open");

  for (const el of clone.querySelectorAll(
    "style, .pb-block-toolbar, .pb-drop-indicator, .pb-canvas-empty, .pb-dropzone-empty",
  )) {
    el.remove();
  }

  for (const chrome of [
    ...clone.querySelectorAll(".pb-block-chrome"),
  ].reverse()) {
    const keep = [...chrome.childNodes].filter((node) => {
      if (node.nodeType !== 1) return true;
      const el = node as Element;
      return !el.classList.contains("pb-block-toolbar");
    });
    if (keep.length === 0) {
      chrome.remove();
      continue;
    }
    chrome.replaceWith(...keep);
  }

  for (const dz of [...clone.querySelectorAll(".pb-dropzone")].reverse()) {
    dz.replaceWith(...dz.childNodes);
  }

  // Canvas wraps each root block in an anonymous div — unwrap when it only
  // holds block roots (or nested wrappers).
  const unwrapPass = () => {
    for (const el of [...clone.querySelectorAll("div")].reverse()) {
      if (el === clone) continue;
      if (el.hasAttribute("data-block-id") || el.hasAttribute("data-pb-page")) {
        continue;
      }
      if (el.attributes.length > 0) continue;
      el.replaceWith(...el.childNodes);
    }
  };
  unwrapPass();
  unwrapPass();

  return clone;
};

/** Prefer live canvas DOM (chrome stripped) so Code matches what authors see. */
export const captureCanvasPageHtml = (pageId: string): string | null => {
  if (typeof document === "undefined") return null;

  const canvases = [
    ...document.querySelectorAll<HTMLElement>(
      "[data-pb-page][data-pb-surface='canvas']",
    ),
  ];
  const root =
    canvases.find((el) => el.getAttribute("data-pb-page") === pageId) ??
    document.querySelector<HTMLElement>(
      `[data-pb-page="${CSS.escape(pageId)}"]`,
    ) ??
    canvases[0] ??
    null;
  if (!root) return null;

  return stripEditorChrome(root).outerHTML;
};

const renderPageElement = (
  page: Page,
  registry: BlockRegistry,
  localeConfig: LocaleConfig,
  activeLocale: string,
) => (
  <RenderPage
    page={page}
    registry={registry}
    localeConfig={localeConfig}
    activeLocale={activeLocale}
    surface="open"
    renderContext={{ locale: activeLocale, device: "desktop" }}
  />
);

/** Resolve body markup: canvas first, then RenderPage; reject empty shells. */
export const resolvePageBodyHtml = (
  page: Page,
  registry: BlockRegistry,
  localeConfig: LocaleConfig,
  activeLocale: string,
): string => {
  const fromCanvas = captureCanvasPageHtml(page.id);
  if (fromCanvas && (page.blocks.length === 0 || hasBlockMarkup(fromCanvas))) {
    return fromCanvas;
  }

  const fromRender = renderClientMarkup(
    renderPageElement(page, registry, localeConfig, activeLocale),
  );
  if (fromRender && (page.blocks.length === 0 || hasBlockMarkup(fromRender))) {
    return fromRender;
  }

  return fromCanvas || fromRender || "";
};

export const serializePageHtml = (
  page: Page,
  registry: BlockRegistry,
  localeConfig: LocaleConfig,
  activeLocale: string,
): string => {
  const { css } = composePageCss(page);
  const body = resolvePageBodyHtml(page, registry, localeConfig, activeLocale);

  const styleBlock = css.trim() ? `<style>\n${formatCss(css)}\n</style>\n` : "";

  return formatHtml(
    `<!DOCTYPE html><html lang="${activeLocale}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>${styleBlock}</head><body>${body}</body></html>`,
  );
};

/** Body markup only (no document chrome) — for side-by-side with CSS. */
export const serializePageBodyHtml = (
  page: Page,
  registry: BlockRegistry,
  localeConfig: LocaleConfig,
  activeLocale: string,
): string =>
  formatHtml(resolvePageBodyHtml(page, registry, localeConfig, activeLocale));

export const serializeBlockHtml = (
  block: Block,
  registry: BlockRegistry,
  localeConfig: LocaleConfig,
  activeLocale: string,
): string => {
  const markup = renderClientMarkup(
    <RenderBlock
      block={block}
      registry={registry}
      localeConfig={localeConfig}
      activeLocale={activeLocale}
      surface="open"
      renderContext={{ locale: activeLocale, device: "desktop" }}
    />,
  );
  return formatHtml(markup);
};

export const serializePageCss = (page: Page): string => {
  const { css } = composePageCss(page);
  return formatCss(css) || "/* empty page CSS */";
};

export const serializeBlockCss = (block: Block): string => {
  const rules = collectBlockStyleCssRules(block);
  return formatCss(rules.join("\n\n")) || "/* no styles yet */";
};

export const serializePageJson = (page: Page): string => formatJson(page);

export { formatCss, formatHtml, formatJson };
