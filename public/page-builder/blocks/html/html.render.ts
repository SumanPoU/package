import { resolveProps } from '../../lib/i18nResolve';
import { sanitizeBlockHtml } from '../../lib/sanitizeHtml';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

export function renderHtmlToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const safe = sanitizeBlockHtml(resolved.code ?? '');
  return `<div class="b-${block.id}" style="box-sizing:border-box;width:100%;max-width:100%;min-width:0;overflow-x:auto">${safe}</div>`;
}
