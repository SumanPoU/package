import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderQuoteToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  return `<blockquote class="b-${block.id}" style="padding:16px;margin:16px 0;border-left:4px solid #d1d5db;background-color:#f9fafb">
          <p style="font-size:1.25rem;font-style:italic;font-weight:500;line-height:1.625;color:#111827;margin:0">"${resolved.text}"</p>
          ${resolved.author ? `<footer style="margin-top:8px;font-size:0.875rem;color:#6b7280">— ${resolved.author}</footer>` : ''}
        </blockquote>`;
}
