const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "ul",
  "ol",
  "li",
  "a",
  "span",
]);

const SAFE_HREF = /^(https?:|mailto:|#)/i;

/**
 * Strip scripts / event handlers from rich-text HTML while preserving Unicode
 * (including Nepali). Allow-list tags only.
 *
 * ponytail: ceiling = regex/DOMParser subset sanitizer, not a full HTML5 parser;
 * upgrade path = isomorphic DOMPurify with the same allow-list if hosts need it.
 */
export const sanitizeRichText = (html: string): string => {
  if (!html) return "";
  if (typeof DOMParser === "undefined") {
    return sanitizeRichTextFallback(html);
  }

  const doc = new DOMParser().parseFromString(
    `<div id="pb-rt-root">${html}</div>`,
    "text/html",
  );
  const root = doc.getElementById("pb-rt-root");
  if (!root) return sanitizeRichTextFallback(html);

  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (
      tag === "script" ||
      tag === "style" ||
      tag === "iframe" ||
      tag === "object" ||
      tag === "form"
    ) {
      return "";
    }

    const children = Array.from(el.childNodes).map(walk).join("");

    if (!ALLOWED_TAGS.has(tag)) {
      return children;
    }

    if (tag === "br") return "<br />";

    if (tag === "a") {
      const href = el.getAttribute("href") ?? "";
      if (!SAFE_HREF.test(href)) {
        return children;
      }
      const safe = href.replace(/"/g, "&quot;");
      return `<a href="${safe}">${children}</a>`;
    }

    return `<${tag}>${children}</${tag}>`;
  };

  return Array.from(root.childNodes).map(walk).join("");
};

/** Node / non-DOM environments: strip the obvious XSS vectors. */
const sanitizeRichTextFallback = (html: string): string =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?script\b[^>]*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/<\/?(?:iframe|object|embed|form|link|meta|style)\b[^>]*>/gi, "");
