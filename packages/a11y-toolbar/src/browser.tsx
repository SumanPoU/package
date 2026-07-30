/**
 * Browser / WordPress drop-in entry.
 * Built as a minified IIFE: `dist/a11y-toolbar.min.js`
 * Global: `window.ItzsaA11yToolbar`
 *
 * Bundles React + ReactDOM so classic WordPress / static HTML sites
 * only need this script + the CSS file.
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { A11yToolbar, type A11yToolbarProps } from "./A11yToolbar";
import { getA11yFoucScript } from "./fouc-script";
import { EN_MESSAGES, NE_MESSAGES } from "./i18n";
import { A11Y_CONTENT_ATTR } from "./types";

export type ItzsaA11yMountOptions = A11yToolbarProps & {
  /**
   * Mount target — CSS selector or element.
   * Default: create and append a container to `document.body`.
   */
  target?: string | HTMLElement;
  /**
   * Ensure a content root exists for effects / FOUC.
   * - `true` → set `data-a11y-content` on `document.body` if missing
   * - selector / element → set the attribute on that node
   */
  contentRoot?: true | string | HTMLElement;
};

let root: Root | null = null;
let hostEl: HTMLElement | null = null;

function resolveElement(
  target: string | HTMLElement | undefined,
): HTMLElement | null {
  if (!target) return null;
  if (typeof target === "string") {
    return document.querySelector(target);
  }
  return target;
}

function ensureContentRoot(
  contentRoot: ItzsaA11yMountOptions["contentRoot"],
): void {
  if (!contentRoot) return;
  const el = contentRoot === true ? document.body : resolveElement(contentRoot);
  if (!el) {
    console.warn(
      "[@itzsa/a11y-toolbar] contentRoot not found — effects will not apply.",
    );
    return;
  }
  if (!el.hasAttribute(A11Y_CONTENT_ATTR)) {
    el.setAttribute(A11Y_CONTENT_ATTR, "");
  }
}

/**
 * Mount the accessibility toolbar on the page.
 * Safe to call once; call `unmount()` before remounting.
 */
export function mount(options: ItzsaA11yMountOptions = {}): HTMLElement {
  if (typeof document === "undefined") {
    throw new Error(
      "[@itzsa/a11y-toolbar] mount() requires a browser document.",
    );
  }

  const { target, contentRoot, ...toolbarProps } = options;
  ensureContentRoot(contentRoot);

  if (root) {
    unmount();
  }

  let el = resolveElement(target);
  if (!el) {
    el = document.createElement("div");
    el.setAttribute("data-itzsa-a11y-host", "");
    document.body.appendChild(el);
  }
  hostEl = el;

  root = createRoot(el);
  root.render(createElement(A11yToolbar, toolbarProps));
  return el;
}

/** Tear down a previous `mount()`. */
export function unmount(): void {
  if (root) {
    root.unmount();
    root = null;
  }
  if (hostEl?.hasAttribute("data-itzsa-a11y-host")) {
    hostEl.remove();
  }
  hostEl = null;
}

export { EN_MESSAGES, getA11yFoucScript, NE_MESSAGES };

export {
  DEFAULT_A11Y_SHORTCUTS,
  formatShortcutLabel,
  mergeA11yShortcuts,
  resolveA11yShortcuts,
} from "./shortcuts";

export type { A11yToolbarProps };
export type {
  A11yKeyCombo,
  A11yShortcutAction,
  A11yShortcutDef,
} from "./shortcuts";
