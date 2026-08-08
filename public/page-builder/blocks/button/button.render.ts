import { resolveProps } from '../../lib/i18nResolve';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

export function renderButtonToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const s = block.style;
  const bBg = s.backgroundColor || '#111827';
  const btnStyle = `background:${bBg};border:none;padding:10px 22px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;display:inline-block;text-decoration:none`;
  if (resolved.href) {
    const target = resolved.target === '_blank' ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${resolved.href}"${target} class="b-${block.id}" style="${btnStyle}">${resolved.text}</a>`;
  }
  return `<button class="b-${block.id}" style="${btnStyle}">${resolved.text}</button>`;
}
