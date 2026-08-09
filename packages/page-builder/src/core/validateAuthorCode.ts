import {
  type CssParseOptions,
  parseAuthorCss,
} from "./cssParser";
import { composePageJs, validateCustomScript } from "./customJsComposer";
import type { CustomScript, Page } from "./types";

export type AuthorCodeValidation = {
  ok: boolean;
  cssErrors: string[];
  jsErrors: string[];
};

const collectCss = (
  raw: string | undefined,
  label: string,
  options: CssParseOptions,
  out: string[],
) => {
  if (!raw?.trim()) return;
  const parsed = parseAuthorCss(raw, options);
  for (const err of parsed.errors) {
    out.push(`${label}: ${err.message}`);
  }
};

/**
 * Host-facing re-validation for save/publish (ADR / §22).
 * Parses raw author CSS (including @import reject) + CustomScript shapes.
 */
export const validateAuthorCode = (
  page: Page,
  options: CssParseOptions = {},
): AuthorCodeValidation => {
  const cssErrors: string[] = [];
  collectCss(page.globalCss, "globalCss", options, cssErrors);

  const walk = (blocks: Page["blocks"]) => {
    for (const block of blocks) {
      collectCss(block.customCss, `block:${block.id}.customCss`, options, cssErrors);
      if (block.children?.length) walk(block.children);
    }
  };
  walk(page.blocks);

  const { errors: jsComposeErrors } = composePageJs(page);

  return {
    ok: cssErrors.length === 0 && jsComposeErrors.length === 0,
    cssErrors,
    jsErrors: jsComposeErrors,
  };
};

/** Narrow unknown JSON to CustomScript or fail. */
export const asCustomScript = (value: unknown): CustomScript | null => {
  const result = validateCustomScript(value);
  return result.ok ? result.script : null;
};
