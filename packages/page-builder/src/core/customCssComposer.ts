import { collectAllBlockStyleCss, formatCustomCssRules } from "./blockStyleCss";
import {
  type CssParseError,
  type CssParseOptions,
  parseAuthorCss,
} from "./cssParser";
import type { Page } from "./types";

export type ComposeCssResult = {
  css: string;
  errors: CssParseError[];
};

/**
 * Compose page global CSS + per-block structured style / customCss / visibility.
 * Block rules use `.b-{id}` (see `blockClassName`); custom CSS accepts
 * declaration-only input or `.element` as a shortcut for that selector.
 */
export const composePageCss = (
  page: Page,
  options: CssParseOptions = {},
): ComposeCssResult => {
  const errors: CssParseError[] = [];
  const chunks: string[] = [];

  if (page.globalCss?.trim()) {
    const parsed = parseAuthorCss(page.globalCss, options);
    errors.push(...parsed.errors);
    if (parsed.ok) chunks.push(parsed.css.trim());
  }

  for (const rule of collectAllBlockStyleCss(page.blocks)) {
    const parsed = parseAuthorCss(rule, options);
    errors.push(...parsed.errors);
    if (parsed.ok && parsed.css.trim()) chunks.push(parsed.css.trim());
  }

  return { css: chunks.filter(Boolean).join("\n\n"), errors };
};

export const composeBlockCss = (
  blockId: string,
  customCss: string,
  options: CssParseOptions = {},
): ComposeCssResult => {
  const errors: CssParseError[] = [];
  const chunks: string[] = [];
  for (const rule of formatCustomCssRules(customCss, blockId)) {
    const parsed = parseAuthorCss(rule, options);
    errors.push(...parsed.errors);
    if (parsed.ok && parsed.css.trim()) chunks.push(parsed.css.trim());
  }
  return { css: chunks.join("\n"), errors };
};
