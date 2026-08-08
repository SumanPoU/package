import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderProgressBarToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const muted = '#6b7280';
  const percentage = Math.min(100, Math.max(0, parseInt(resolved.percentage) || 0));

  return `<div class="b-${block.id}" style="width:100%;display:flex;flex-direction:column;gap:6px">
          <div style="display:flex;justify-content:space-between;font-size:0.875rem;font-weight:500">
            <span>${resolved.label}</span>
            <span>${percentage}%</span>
          </div>
          <div style="width:100%;background-color:#e5e7eb;border-radius:9999px;height:10px;overflow:hidden">
            <div style="background-color:#2563eb;height:10px;border-radius:9999px;width:${percentage}%"></div>
          </div>
        </div>`;
}
