import { resolveProps } from '../../lib/i18nResolve';
import { sanitizeBlockHtml } from '../../lib/sanitizeHtml';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

export function renderTextToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const s = block.style;
  const centerInline =
    s.align === 'center' ? 'margin-inline:auto;' : s.align === 'right' ? 'margin-left:auto;' : '';
  const safe = sanitizeBlockHtml(resolved.text ?? '');
  return `<div class="b-${block.id}" style="font-size:1rem;line-height:1.7;margin:0;${centerInline}">${safe}</div>`;
}
