import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize admin-authored HTML for page-builder export/render.
 * Fail-closed allowlist — scripts, event handlers, and unknown tags are stripped.
 * Keep in page-builder/lib (not app common/) so blocks stay package-ready.
 */
const SANITIZE_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'div',
    'span',
    'section',
    'article',
    'header',
    'footer',
    'main',
    'aside',
    'figure',
    'figcaption',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'b',
    'i',
    'em',
    'strong',
    'u',
    's',
    'strike',
    'sub',
    'sup',
    'mark',
    'code',
    'pre',
    'ul',
    'ol',
    'li',
    'blockquote',
    'hr',
    'a',
    'img',
    'video',
    'source',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'colgroup',
    'col',
  ],
  ALLOWED_ATTR: [
    'class',
    'style',
    'id',
    'href',
    'target',
    'rel',
    'src',
    'alt',
    'width',
    'height',
    'controls',
    'colspan',
    'rowspan',
  ],
  ALLOW_DATA_ATTR: false,
  FORCE_BODY: true,
};

export function sanitizeBlockHtml(html: string): string {
  if (!html) return '';
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
