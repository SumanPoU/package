import { collectAllBlockStyleCss, formatCustomCssRules } from "./blockStyleCss";
import {
  type CssParseError,
  type CssParseOptions,
  parseAuthorCss,
} from "./cssParser";
import { MOTION_CSS, pageUsesMotion } from "./motion";
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
/** Drop `@import` only — keep remaining CSS so url() warnings don't blank the page. */
const stripImportAtRules = (css: string): string =>
  css.replace(/@import\b[^;]*;?/gi, "").trim();

const pushAuthorCss = (
  raw: string,
  options: CssParseOptions,
  errors: CssParseError[],
  chunks: string[],
) => {
  const sanitized = stripImportAtRules(raw);
  if (!sanitized) return;
  const parsed = parseAuthorCss(sanitized, options);
  errors.push(...parsed.errors);
  chunks.push(sanitized);
};

export const composePageCss = (
  page: Page,
  options: CssParseOptions = {},
): ComposeCssResult => {
  const errors: CssParseError[] = [];
  const chunks: string[] = [];

  if (pageUsesMotion(page.blocks)) {
    chunks.push(MOTION_CSS);
  }

  if (page.globalCss?.trim()) {
    pushAuthorCss(page.globalCss, options, errors, chunks);
  }

  for (const rule of collectAllBlockStyleCss(page.blocks)) {
    pushAuthorCss(rule, options, errors, chunks);
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
    pushAuthorCss(rule, options, errors, chunks);
  }
  return { css: chunks.join("\n"), errors };
};
