import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderSpacerToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const height = resolved.height ? `${resolved.height}px` : '50px';
  return `<div class="b-${block.id}" style="width:100%;height:${height}"></div>`;
}
