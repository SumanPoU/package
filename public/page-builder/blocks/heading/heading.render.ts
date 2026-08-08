import { resolveProps } from '../../lib/i18nResolve';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

export function renderHeadingToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const level = resolved.level || '2';
  const hSize =
    {
      '1': 'clamp(2.25rem,5vw,3.5rem)',
      '2': 'clamp(1.5rem,3vw,2.25rem)',
      '3': 'clamp(1.25rem,2.5vw,1.875rem)',
      '4': 'clamp(1.125rem,2vw,1.5rem)',
      '5': '1.125rem',
      '6': '1rem',
    }[level] || 'clamp(1.5rem,3vw,2.25rem)';
  return `<h${level} class="b-${block.id}" style="font-size:${hSize};font-weight:700;margin:0;line-height:1.15">${resolved.text}</h${level}>`;
}
