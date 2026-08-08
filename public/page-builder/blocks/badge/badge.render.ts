import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderBadgeToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  return `<span class="b-${block.id}" style="display:inline-flex;align-items:center;border-radius:9999px;background-color:#eff6ff;padding:4px 8px;font-size:0.75rem;font-weight:500;color:#1d4ed8;box-shadow:inset 0 0 0 1px rgba(29,78,216,0.1)">${resolved.text}</span>`;
}
