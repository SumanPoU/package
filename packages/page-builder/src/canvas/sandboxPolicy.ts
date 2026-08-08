export const CANVAS_SANDBOX = "allow-scripts allow-forms" as const;

export type SandboxPolicyOptions = {
  /** Explicit allow-list for CSP `connect-src`. Empty / omit → `'none'`. */
  allowedConnectOrigins?: string[];
  allowedImgOrigins?: string[];
  allowedFontOrigins?: string[];
};

/**
 * Single source of truth for canvas iframe sandbox + CSP template.
 * Changing CANVAS_SANDBOX requires an architecture amendment + regression test.
 */
export const getCanvasSandboxAttribute = (): typeof CANVAS_SANDBOX =>
  CANVAS_SANDBOX;

/**
 * CSP template with `{{nonce}}` placeholder. Host / CanvasFrame fills at mint time.
 * `connect-src` defaults to `'none'` (network default-deny for author JS).
 */
export const buildCspTemplate = (
  options: SandboxPolicyOptions = {},
): string => {
  const connect = options.allowedConnectOrigins?.length
    ? options.allowedConnectOrigins.join(" ")
    : "'none'";
  const imgExtra = options.allowedImgOrigins?.length
    ? ` ${options.allowedImgOrigins.join(" ")}`
    : "";
  const fontExtra = options.allowedFontOrigins?.length
    ? ` ${options.allowedFontOrigins.join(" ")}`
    : "";

  return [
    "default-src 'self'",
    "script-src 'self' 'nonce-{{nonce}}'",
    "style-src 'self' 'nonce-{{nonce}}'",
    `img-src 'self' data: blob:${imgExtra}`,
    `font-src 'self' data:${fontExtra}`,
    `connect-src ${connect}`,
    "frame-src 'none'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "base-uri 'none'",
  ].join("; ");
};

export const fillCspNonce = (template: string, nonce: string): string =>
  template.split("{{nonce}}").join(nonce);

export const createCanvasCsp = (
  nonce: string,
  options: SandboxPolicyOptions = {},
): string => fillCspNonce(buildCspTemplate(options), nonce);
