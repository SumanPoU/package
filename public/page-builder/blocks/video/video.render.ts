import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderVideoToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  return `<div class="b-${block.id}" style="width:100%;aspect-ratio:16/9">
          <iframe style="width:100%;height:100%;border:none;border-radius:8px" src="${resolved.url}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>`;
}
