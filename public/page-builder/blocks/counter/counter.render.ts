import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderCounterToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const muted = '#6b7280';
  return `<div class="b-${block.id}" style="display:flex;flex-direction:column;align-items:center;text-align:center">
          <div style="font-size:2.25rem;font-weight:700;color:#111827;margin-bottom:4px">${resolved.targetNumber}</div>
          <div style="font-size:0.875rem;color:${muted};text-transform:uppercase;letter-spacing:0.05em">${resolved.label}</div>
        </div>`;
}
