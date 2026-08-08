import React from 'react';
import { renderToString } from 'react-dom/server';
import * as LucideIcons from 'lucide-react';

import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderStarRatingToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const rating = parseFloat(resolved.rating) || 0;
  const max = parseInt(resolved.maxRating) || 5;

  let starsHtml = '';
  for (let i = 0; i < max; i++) {
    const StarIcon = LucideIcons.Star;
    const isFilled = i < rating;
    starsHtml += renderToString(
      React.createElement(StarIcon, {
        size: 20,
        color: isFilled ? '#facc15' : '#d1d5db',
        fill: isFilled ? '#facc15' : 'none',
      }),
    );
  }

  return `<div class="b-${block.id}" style="display:flex;align-items:center;gap:4px">${starsHtml}</div>`;
}
