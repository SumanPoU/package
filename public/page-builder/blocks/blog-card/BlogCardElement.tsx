import { ArrowRight } from 'lucide-react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

import type { Block } from '../../types';
import { resolveProps } from '../../utils';
import {
  cardShadowHoverCss,
  cardShadowToCss,
  parseTextStyle,
  textStyleToCss,
} from './blog-card.styleUtils';

const ASPECT_RATIO: Record<string, string> = {
  '16:9': '56.25%',
  '4:3': '75%',
  '1:1': '100%',
};

// Line-clamp kept as inline style rather than a Tailwind utility class so this
// stays byte-identical in behaviour with the raw-HTML export renderer.
const clamp = (lines: number): CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

export function BlogCardElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const paddingBottom = ASPECT_RATIO[resolved.imageAspectRatio] || ASPECT_RATIO['16:9'];
  const radius = resolved.cardBorderRadius || '12px';
  const padding = resolved.cardPadding || '20px';
  const shadow = cardShadowToCss(resolved.cardShadow);
  const hoverShadow = cardShadowHoverCss(resolved.cardShadow, resolved.hoverEffect);
  const hoverEffect = resolved.hoverEffect || 'lift';
  const linkTarget = resolved.linkTarget || '_self';
  const isBlank = linkTarget === '_blank';

  // Accent used for the category dot, CTA color and focus ring — pulled from
  // the category text style if the author set one, otherwise a quiet
  // editorial blue rather than a generic Tailwind default.
  const accent = parseTextStyle(resolved.categoryStyle).color || '#2C5F85';
  const authorName = resolved.authorName?.trim() || '';
  const publishDate = resolved.publishDate?.trim() || '';

  const cardStyle: CSSProperties = {
    // Inherit block typography from the canvas wrapper (`.b-{id}`). Global
    // `h3`/`p` rules in index.css set Outfit explicitly and would otherwise
    // ignore the Advanced Style font family on the parent.
    fontFamily: 'inherit',
    backgroundColor: resolved.cardBackgroundColor || '#ffffff',
    borderColor: resolved.cardBorderColor || '#e7e5e0',
    borderRadius: radius,
    boxShadow: shadow,
    transition:
      'transform 220ms cubic-bezier(.22,.61,.36,1), box-shadow 220ms ease, border-color 220ms ease',
  };

  const textBase: CSSProperties = { fontFamily: 'inherit' };

  const categoryBadge = resolved.category ? (
    <span
      className="inline-flex w-fit items-center gap-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-zinc-900"
      style={{ ...textBase, ...textStyleToCss(resolved.categoryStyle) }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />
      {resolved.category}
    </span>
  ) : null;

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden border border-solid text-zinc-900',
        hoverEffect === 'lift' && 'hover:-translate-y-1.5',
      )}
      style={cardStyle}
      onMouseEnter={(e) => {
        if (hoverEffect === 'lift' || hoverEffect === 'shadow-grow') {
          e.currentTarget.style.boxShadow = hoverShadow || shadow;
          e.currentTarget.style.borderColor = `${accent}55`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadow;
        e.currentTarget.style.borderColor = resolved.cardBorderColor || '#e7e5e0';
      }}
    >
      {/* Thumbnail is not a link — CTA is the sole click target (a11y). cursor-pointer is affordance only. */}
      {resolved.thumbnail ? (
        <div
          className="relative w-full cursor-pointer overflow-hidden bg-zinc-200"
          style={{ paddingBottom, borderRadius: `${radius} ${radius} 0 0` }}
        >
          <img
            src={resolved.thumbnail}
            alt=""
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(.22,.61,.36,1)]',
              hoverEffect === 'zoom-image' && 'group-hover:scale-[1.06]',
            )}
          />
          {/* Category floats on the image, frosted-glass style — the pattern
              real editorial sites use, rather than a flat pill sitting in
              the text block below. */}
          {categoryBadge ? (
            <div className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 shadow-sm backdrop-blur-sm">
              {categoryBadge}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-3" style={{ padding }}>
        {/* Fallback inline badge for text-only cards with no thumbnail to float on */}
        {!resolved.thumbnail && categoryBadge ? (
          <div className="w-fit rounded-full bg-zinc-100 px-2.5 py-1">{categoryBadge}</div>
        ) : null}

        {resolved.title ? (
          <h3
            className="m-0 text-xl font-bold leading-snug tracking-tight text-zinc-900"
            style={{ ...clamp(2), ...textBase, ...textStyleToCss(resolved.titleStyle) }}
          >
            {resolved.title}
          </h3>
        ) : null}

        {(authorName || publishDate) && (
          <p className="m-0 flex flex-wrap items-center gap-x-1.5 text-xs font-medium tracking-wide text-zinc-500">
            {authorName ? (
              <span style={{ ...textBase, ...textStyleToCss(resolved.authorStyle) }}>
                {authorName}
              </span>
            ) : null}
            {authorName && publishDate ? (
              <span aria-hidden className="opacity-60">
                ·
              </span>
            ) : null}
            {publishDate ? (
              <span
                className="tabular-nums"
                style={{ ...textBase, ...textStyleToCss(resolved.dateStyle) }}
              >
                {publishDate}
              </span>
            ) : null}
          </p>
        )}

        {resolved.excerpt ? (
          <p
            className="m-0 text-sm leading-relaxed text-zinc-600"
            style={{ ...clamp(3), ...textBase, ...textStyleToCss(resolved.excerptStyle) }}
          >
            {resolved.excerpt}
          </p>
        ) : null}

        {resolved.readMoreLabel && resolved.postUrl ? (
          <a
            href={resolved.postUrl}
            target={isBlank ? '_blank' : undefined}
            rel={isBlank ? 'noopener noreferrer' : undefined}
            className="mt-auto inline-flex w-full items-center gap-1.5 border-t border-solid border-zinc-100 pt-3.5 text-sm font-semibold no-underline transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              fontFamily: 'inherit',
              color: accent,
              outlineColor: accent,
              ...textStyleToCss(resolved.readMoreStyle),
            }}
          >
            {resolved.readMoreLabel}
            <ArrowRight
              className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        ) : null}
      </div>
    </article>
  );
}
