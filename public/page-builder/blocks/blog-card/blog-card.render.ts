import { resolveProps } from '../../lib/i18nResolve';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';
import {
  cardShadowHoverCss,
  cardShadowToCss,
  parseTextStyle,
  textStyleToInlineCssString,
} from './blog-card.styleUtils';

const ASPECT_RATIO: Record<string, string> = {
  '16:9': '56.25%',
  '4:3': '75%',
  '1:1': '100%',
};

function styleAttr(css: string): string {
  return css ? ` style="${css}"` : '';
}

export function renderBlogCardToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const paddingBottom = ASPECT_RATIO[resolved.imageAspectRatio] || ASPECT_RATIO['16:9'];
  const radius = resolved.cardBorderRadius || '12px';
  const padding = resolved.cardPadding || '20px';
  const shadow = cardShadowToCss(resolved.cardShadow);
  const hoverEffect = resolved.hoverEffect || 'lift';
  const hoverShadow = cardShadowHoverCss(resolved.cardShadow, hoverEffect);
  const linkTarget = resolved.linkTarget || '_self';
  const isBlank = linkTarget === '_blank';
  const blankAttrs = isBlank ? ' target="_blank" rel="noopener noreferrer"' : '';
  const cls = `b-${block.id}`;

  // Accent used for the category dot / focus ring — pulled from the category
  // text style if the author set one, otherwise a quiet editorial blue.
  const accent = parseTextStyle(resolved.categoryStyle).color || '#2C5F85';

  const cardCss = [
    'display:flex',
    'flex-direction:column',
    'overflow:hidden',
    'border:1px solid',
    `border-color:${resolved.cardBorderColor || '#e7e5e0'}`,
    `border-radius:${radius}`,
    `background-color:${resolved.cardBackgroundColor || '#ffffff'}`,
    'color:#18181b',
    `box-shadow:${shadow}`,
    'transition:transform 220ms cubic-bezier(.22,.61,.36,1),box-shadow 220ms ease,border-color 220ms ease',
  ].join(';');

  const hoverRules: string[] = [
    // Beat global `h3`/`p{font-family:Outfit}` so Advanced Style font on `.b-{id}` cascades.
    `.${cls},.${cls} h3,.${cls} p,.${cls} span,.${cls} a{font-family:inherit}`,
    `.${cls} a:focus-visible{outline:2px solid ${accent};outline-offset:2px;border-radius:2px}`,
  ];
  if (hoverEffect === 'lift') {
    hoverRules.push(
      `.${cls}:hover{transform:translateY(-6px);border-color:${accent}55;${
        hoverShadow ? `box-shadow:${hoverShadow};` : ''
      }}`,
    );
  } else if (hoverEffect === 'shadow-grow' && hoverShadow) {
    hoverRules.push(`.${cls}:hover{box-shadow:${hoverShadow};border-color:${accent}55;}`);
  }
  if (hoverEffect === 'zoom-image') {
    hoverRules.push(
      `.${cls} .bc-thumb{overflow:hidden}`,
      `.${cls} .bc-thumb img{transition:transform 400ms cubic-bezier(.22,.61,.36,1)}`,
      `.${cls}:hover .bc-thumb img{transform:scale(1.06)}`,
    );
  }
  hoverRules.push(`.${cls}:hover .bc-cta-arrow{transform:translateX(3px)}`);

  // Category badge floats on the image, frosted-glass style — only when
  // there's an image to float it over. Falls back to an inline pill in the
  // content area otherwise (kept for text-only cards).
  const categoryOnImage =
    resolved.thumbnail && resolved.category
      ? `<div style="position:absolute;top:12px;left:12px;z-index:1;display:inline-flex;align-items:center;gap:6px;padding:5px 11px 5px 9px;border-radius:9999px;background:rgba(255,255,255,0.92);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:0 1px 3px rgba(0,0,0,0.12)">
          <span style="width:6px;height:6px;flex-shrink:0;border-radius:9999px;background:${accent}"></span>
          <span${styleAttr(
            [
              'font-size:11px',
              'font-weight:700',
              'text-transform:uppercase',
              'letter-spacing:0.06em',
              'color:#18181b',
              textStyleToInlineCssString(resolved.categoryStyle),
            ]
              .filter(Boolean)
              .join(';'),
          )}>${resolved.category}</span>
        </div>`
      : '';

  const categoryInline =
    !resolved.thumbnail && resolved.category
      ? `<span${styleAttr(
          [
            'display:inline-flex',
            'width:fit-content',
            'align-items:center',
            'gap:6px',
            'border-radius:9999px',
            'background:#f4f4f5',
            'padding:3px 11px 3px 9px',
            'font-size:11px',
            'font-weight:700',
            'text-transform:uppercase',
            'letter-spacing:0.06em',
            'color:#18181b',
            textStyleToInlineCssString(resolved.categoryStyle),
          ]
            .filter(Boolean)
            .join(';'),
        )}><span style="width:6px;height:6px;border-radius:9999px;background:${accent}"></span>${resolved.category}</span>`
      : '';

  // Thumbnail is not a link — CTA is the sole click target (a11y). cursor:pointer is affordance only.
  const thumb = resolved.thumbnail
    ? `<div class="bc-thumb" style="position:relative;width:100%;padding-bottom:${paddingBottom};overflow:hidden;background:#e7e5e0;border-radius:${radius} ${radius} 0 0;cursor:pointer">
        <img src="${resolved.thumbnail}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />
        ${categoryOnImage}
      </div>`
    : '';

  const title = resolved.title
    ? `<h3${styleAttr(
        [
          'margin:0',
          'font-size:1.25rem',
          'font-weight:700',
          'line-height:1.35',
          'letter-spacing:-0.01em',
          'color:#18181b',
          'display:-webkit-box',
          '-webkit-line-clamp:2',
          '-webkit-box-orient:vertical',
          'overflow:hidden',
          textStyleToInlineCssString(resolved.titleStyle),
        ]
          .filter(Boolean)
          .join(';'),
      )}>${resolved.title}</h3>`
    : '';

  const authorName = resolved.authorName?.trim();
  const publishDate = resolved.publishDate?.trim();
  const author = authorName
    ? `<span${styleAttr(textStyleToInlineCssString(resolved.authorStyle))}>${authorName}</span>`
    : '';
  const date = publishDate
    ? `<span${styleAttr(
        ['font-variant-numeric:tabular-nums', textStyleToInlineCssString(resolved.dateStyle)]
          .filter(Boolean)
          .join(';'),
      )}>${publishDate}</span>`
    : '';
  const meta =
    author || date
      ? `<p style="margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:12px;font-weight:500;letter-spacing:0.01em;color:#71717a">${author}${
          author && date ? '<span aria-hidden="true" style="opacity:.6">·</span>' : ''
        }${date}</p>`
      : '';

  const excerpt = resolved.excerpt
    ? `<p${styleAttr(
        [
          'margin:0',
          'font-size:0.875rem',
          'line-height:1.65',
          'color:#52525b',
          'display:-webkit-box',
          '-webkit-line-clamp:3',
          '-webkit-box-orient:vertical',
          'overflow:hidden',
          textStyleToInlineCssString(resolved.excerptStyle),
        ]
          .filter(Boolean)
          .join(';'),
      )}>${resolved.excerpt}</p>`
    : '';

  const cta =
    resolved.readMoreLabel && resolved.postUrl
      ? `<a href="${resolved.postUrl}"${blankAttrs} class="bc-cta"${styleAttr(
          [
            'display:inline-flex',
            'align-items:center',
            'gap:6px',
            'margin-top:auto',
            'padding-top:14px',
            'border-top:1px solid #ececea',
            'width:100%',
            'font-size:14px',
            'font-weight:600',
            `color:${accent}`,
            textStyleToInlineCssString(resolved.readMoreStyle),
          ]
            .filter(Boolean)
            .join(';'),
        )}>${resolved.readMoreLabel}<span class="bc-cta-arrow" aria-hidden="true" style="display:inline-block;transition:transform 220ms cubic-bezier(.22,.61,.36,1)">→</span></a>`
      : '';

  const styleBlock = `<style>.${cls} a{text-decoration:none}.${cls} .bc-cta:hover{text-decoration:underline}${hoverRules.join('')}</style>`;

  return `${styleBlock}<article class="${cls}" style="${cardCss}">
  ${thumb}
  <div style="display:flex;flex:1;flex-direction:column;gap:12px;padding:${padding}">
    ${categoryInline}
    ${title}
    ${meta}
    ${excerpt}
    ${cta}
  </div>
</article>`;
}
