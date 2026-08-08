import { resolveProps } from '../../lib/i18nResolve';
import { buildImageElementCss } from '../../lib/imageStyle';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

export function renderImageToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const s = block.style;
  const centerInline =
    s.align === 'center' ? 'margin-inline:auto;' : s.align === 'right' ? 'margin-left:auto;' : '';
  const imgCss = buildImageElementCss(s);
  const imgStyle = `max-width:100%;height:auto;border-radius:8px;display:block;${centerInline}${imgCss ? `;${imgCss}` : ''}`;
  return `<img class="b-${block.id}" src="${resolved.src}" alt="${resolved.alt}" style="${imgStyle}" />`;
}
