import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderAlertToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const v = resolved.variant || 'info';
  const variants: Record<string, { bg: string; text: string; border: string }> = {
    info: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
    success: { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
    warning: { bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
    error: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
  };
  const colors = variants[v] || variants.info;
  return `<div class="b-${block.id}" style="padding:16px;margin-bottom:16px;font-size:0.875rem;border-radius:8px;border:1px solid ${colors.border};background-color:${colors.bg};color:${colors.text}" role="alert">
          ${resolved.title ? `<span style="font-weight:500;margin-right:4px">${resolved.title}:</span>` : ''}
          ${resolved.text}
        </div>`;
}
