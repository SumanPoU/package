export type CssParseOptions = {
  /** Host allow-list for remote `url(https://…)` / `url(http://…)`. Empty = reject all remote. */
  allowedUrlOrigins?: string[];
  /** Max bytes for allowed `data:` image/font URLs. */
  maxDataUrlBytes?: number;
};

export type CssParseError = {
  message: string;
  index?: number;
};

export type CssParseResult = {
  ok: boolean;
  css: string;
  errors: CssParseError[];
};

const DEFAULT_MAX_DATA = 64_000;

const URL_RE = /url\s*\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
const IMPORT_RE = /@import\b/i;

const isAllowedDataUrl = (raw: string, maxBytes: number): boolean => {
  const value = raw.trim();
  if (!value.toLowerCase().startsWith("data:")) return false;
  if (value.length > maxBytes) return false;
  const lower = value.toLowerCase();
  if (
    lower.startsWith("data:text/html") ||
    lower.startsWith("data:application/javascript") ||
    lower.startsWith("data:text/javascript") ||
    lower.startsWith("data:image/svg+xml")
  ) {
    return false;
  }
  return (
    lower.startsWith("data:image/") ||
    lower.startsWith("data:font/") ||
    lower.startsWith("data:application/font")
  );
};

const isAllowedRemoteUrl = (raw: string, allowedOrigins: string[]): boolean => {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (!allowedOrigins.length) return false;
    return allowedOrigins.some(
      (origin) =>
        url.origin === origin ||
        raw === origin ||
        raw.startsWith(origin.endsWith("/") ? origin : `${origin}/`),
    );
  } catch {
    return false;
  }
};

/**
 * Validate author CSS before composition. Rejects `@import`, protocol-relative
 * urls, disallowed remote `url()`, and dangerous `data:` URLs.
 */
export const parseAuthorCss = (
  input: string,
  options: CssParseOptions = {},
): CssParseResult => {
  const errors: CssParseError[] = [];
  const css = input ?? "";
  const allowed = options.allowedUrlOrigins ?? [];
  const maxData = options.maxDataUrlBytes ?? DEFAULT_MAX_DATA;

  if (IMPORT_RE.test(css)) {
    errors.push({ message: "cssParser: @import is not allowed" });
  }

  URL_RE.lastIndex = 0;
  for (;;) {
    const match = URL_RE.exec(css);
    if (match === null) break;
    const raw = match[2]!.trim();
    if (raw.startsWith("//")) {
      errors.push({
        message: "cssParser: protocol-relative url() is not allowed",
        index: match.index,
      });
      continue;
    }
    if (/^data:/i.test(raw)) {
      if (!isAllowedDataUrl(raw, maxData)) {
        errors.push({
          message: "cssParser: disallowed or oversized data: url()",
          index: match.index,
        });
      }
      continue;
    }
    if (/^https?:/i.test(raw)) {
      if (!isAllowedRemoteUrl(raw, allowed)) {
        errors.push({
          message: "cssParser: remote url() is not on the allow-list",
          index: match.index,
        });
      }
    }
    // Relative / same-document references are allowed.
  }

  return { ok: errors.length === 0, css, errors };
};
