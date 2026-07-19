/**
 * Security helpers for editor HTML / URLs / CSS.
 * All untrusted ingress (setContent, paste HTML mode, media, links) should go through these.
 */

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/** CSS length: `12px`, `50%`, `1.5rem`, `2em` — nothing else. */
const CSS_LENGTH_RE = /^\d+(\.\d+)?(px|%|em|rem)$/i;

/** Allowed text-transform values. */
const TEXT_TRANSFORMS = new Set([
  "uppercase",
  "lowercase",
  "capitalize",
  "none",
]);

/** Max base64 payload when explicitly allowed (512 KB). */
export const DEFAULT_MAX_BASE64_BYTES = 512 * 1024;

/** Max upload file size when using FileReader fallback (2 MB). */
export const DEFAULT_MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "del",
  "code",
  "pre",
  "blockquote",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "video",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "hr",
  "span",
  "mark",
  "sub",
  "sup",
  "div",
]);

const GLOBAL_ATTRS = new Set<string>();

const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "title"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  video: new Set(["src", "controls", "width", "height", "poster"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  li: new Set(["data-checked", "data-type"]),
  ul: new Set(["data-type"]),
  span: new Set(["style"]),
  p: new Set(["style"]),
  h1: new Set(["style"]),
  h2: new Set(["style"]),
  h3: new Set(["style"]),
  h4: new Set(["style"]),
  h5: new Set(["style"]),
  h6: new Set(["style"]),
};

/** Allowed CSS properties on inline style (strict). */
const STYLE_PROPS: Record<string, (v: string) => boolean> = {
  "font-size": (v) => CSS_LENGTH_RE.test(v.trim()),
  "font-family": (v) =>
    /^[\w\s,"'-]+$/i.test(v.trim()) && !/[;{}]|expression|url\s*\(/i.test(v),
  color: (v) =>
    /^(#[0-9a-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|[a-z]+)$/i.test(
      v.trim(),
    ),
  "text-align": (v) => /^(left|right|center|justify)$/i.test(v.trim()),
  "text-transform": (v) => TEXT_TRANSFORMS.has(v.trim().toLowerCase()),
  width: (v) => CSS_LENGTH_RE.test(v.trim()),
  height: (v) => CSS_LENGTH_RE.test(v.trim()),
};

export type SanitizeUrlOptions = {
  /** Allow `data:image/*` (off by default). */
  allowDataImage?: boolean;
  /** Max decoded base64 bytes when allowDataImage. */
  maxDataBytes?: number;
  /** Allow same-origin relative paths starting with `/` (not `//`). */
  allowRelative?: boolean;
};

/**
 * Returns a safe URL or `null` if rejected.
 * Blocks `javascript:`, `vbscript:`, `data:` (unless image data allowed), and protocol-relative `//`.
 */
export function sanitizeUrl(
  raw: string,
  options: SanitizeUrlOptions = {},
): string | null {
  const {
    allowDataImage = false,
    maxDataBytes = DEFAULT_MAX_BASE64_BYTES,
    allowRelative = true,
  } = options;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Protocol-relative URLs are phishing-prone
  if (trimmed.startsWith("//")) return null;

  // Relative path (same origin)
  if (allowRelative && trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    if (/[\s<>"']/.test(trimmed)) return null;
    return trimmed;
  }

  // data:image
  if (trimmed.toLowerCase().startsWith("data:")) {
    if (!allowDataImage) return null;
    const match = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.exec(trimmed);
    if (!match) return null;
    const b64 = trimmed.slice(match[0].length);
    // Approximate decoded size
    const bytes = Math.floor((b64.length * 3) / 4);
    if (bytes > maxDataBytes) return null;
    if (!/^[A-Za-z0-9+/=\s]+$/.test(b64)) return null;
    return trimmed;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (!SAFE_URL_PROTOCOLS.has(url.protocol)) return null;

  // mailto / tel — return as-is after protocol check
  if (url.protocol === "mailto:" || url.protocol === "tel:") {
    return url.toString();
  }

  return url.toString();
}

/** Normalize and validate CSS length for width/height/font-size. */
export function sanitizeCssLength(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!CSS_LENGTH_RE.test(v)) return null;
  return v;
}

export function sanitizeTextTransform(
  raw: string | null | undefined,
): string | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  return TEXT_TRANSFORMS.has(v) ? v : null;
}

/** Sanitize a single `style` attribute value to allowlisted props only. */
export function sanitizeStyleAttr(style: string): string {
  const out: string[] = [];
  for (const part of style.split(";")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const prop = part.slice(0, idx).trim().toLowerCase();
    const value = part.slice(idx + 1).trim();
    if (!value || !STYLE_PROPS[prop]) continue;
    if (STYLE_PROPS[prop](value)) {
      out.push(`${prop}: ${value}`);
    }
  }
  return out.join("; ");
}

function isAllowedAttr(tag: string, name: string): boolean {
  if (GLOBAL_ATTRS.has(name)) return true;
  return TAG_ATTRS[tag]?.has(name) ?? false;
}

function sanitizeElement(el: Element, urlOpts: SanitizeUrlOptions): void {
  const tag = el.tagName.toLowerCase();

  // Remove disallowed tags but keep children
  if (!ALLOWED_TAGS.has(tag)) {
    const parent = el.parentNode;
    if (parent) {
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    }
    return;
  }

  // Strip disallowed attributes
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name.toLowerCase();
    if (name.startsWith("on") || name === "srcdoc") {
      el.removeAttribute(attr.name);
      continue;
    }
    if (!isAllowedAttr(tag, name)) {
      el.removeAttribute(attr.name);
      continue;
    }

    if (name === "href" || name === "src" || name === "poster") {
      const safe = sanitizeUrl(attr.value, {
        ...urlOpts,
        allowDataImage: name === "src" ? urlOpts.allowDataImage : false,
      });
      if (!safe) {
        el.removeAttribute(attr.name);
      } else {
        el.setAttribute(name, safe);
      }
    }

    if (name === "width" || name === "height") {
      const safe =
        sanitizeCssLength(attr.value) ??
        (/^\d+$/.test(attr.value.trim()) ? attr.value.trim() : null);
      if (!safe) el.removeAttribute(attr.name);
      else el.setAttribute(name, safe);
    }

    if (name === "style") {
      const safe = sanitizeStyleAttr(attr.value);
      if (!safe) el.removeAttribute("style");
      else el.setAttribute("style", safe);
    }

    if (
      name === "target" &&
      attr.value !== "_blank" &&
      attr.value !== "_self"
    ) {
      el.removeAttribute("target");
    }
  }

  // Harden links
  if (tag === "a" && el.hasAttribute("href")) {
    if (el.getAttribute("target") === "_blank") {
      el.setAttribute("rel", "noopener noreferrer nofollow");
    }
  }

  // video always gets controls (no autoplay)
  if (tag === "video") {
    el.setAttribute("controls", "");
    el.removeAttribute("autoplay");
  }

  for (const child of Array.from(el.children)) {
    sanitizeElement(child, urlOpts);
  }
}

export type SanitizeHtmlOptions = SanitizeUrlOptions & {
  /** When true, empty string stays empty (don't force a paragraph). */
  preserveEmpty?: boolean;
};

/**
 * Sanitize HTML for TipTap `setContent`. Safe in browser (DOMParser).
 * Returns empty string for empty input when `preserveEmpty` is true.
 */
export function sanitizeHtml(
  html: string,
  options: SanitizeHtmlOptions = {},
): string {
  const trimmed = html?.trim() ?? "";
  if (!trimmed) return options.preserveEmpty ? "" : "";

  if (typeof DOMParser === "undefined") {
    // Editor is client-only — never half-sanitize on the server.
    return "";
  }

  const doc = new DOMParser().parseFromString(trimmed, "text/html");
  const body = doc.body;

  for (const child of Array.from(body.children)) {
    sanitizeElement(child, options);
  }

  // Remove comments
  const walker = doc.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
  const comments: Comment[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode as Comment);
  for (const c of comments) c.remove();

  return body.innerHTML;
}

export type MediaValidationResult =
  | { ok: true; src: string; width?: string }
  | { ok: false; error: string };

export function validateMediaInsert(options: {
  src: string;
  width?: string;
  kind: "image" | "video";
  allowBase64?: boolean;
  maxDataBytes?: number;
}): MediaValidationResult {
  const { src, width, kind, allowBase64 = false, maxDataBytes } = options;
  const safe = sanitizeUrl(src, {
    allowDataImage: allowBase64 && kind === "image",
    maxDataBytes,
    allowRelative: true,
  });
  if (!safe) {
    return {
      ok: false,
      error:
        kind === "image"
          ? "Invalid image URL. Use https:// or upload a PNG/JPEG/GIF/WebP under the size limit."
          : "Invalid video URL. Use an https:// link.",
    };
  }
  if (kind === "video" && safe.startsWith("data:")) {
    return {
      ok: false,
      error: "Video data URLs are not allowed. Use an https:// URL.",
    };
  }
  const safeWidth = width ? sanitizeCssLength(width) : undefined;
  if (width && !safeWidth) {
    return { ok: false, error: "Invalid width. Use values like 50% or 300px." };
  }
  return { ok: true, src: safe, width: safeWidth ?? undefined };
}

export function validateLinkHref(
  raw: string,
): { ok: true; href: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Enter a URL." };
  const safe = sanitizeUrl(trimmed, {
    allowDataImage: false,
    allowRelative: true,
  });
  if (!safe) {
    return {
      ok: false,
      error:
        "Invalid URL. Use https://, http://, mailto:, tel:, or a path starting with /.",
    };
  }
  return { ok: true, href: safe };
}
