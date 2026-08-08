import { resolveProps } from '../../lib/i18nResolve';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderMapToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const query = encodeURIComponent(resolved.address || 'New York, NY');
  return `<div class="b-${block.id}" style="width:100%;aspect-ratio:21/9;overflow:hidden;border-radius:8px">
          <iframe width="100%" height="100%" frameborder="0" style="border:0" src="https://www.google.com/maps?q=${query}&output=embed" allowfullscreen></iframe>
        </div>`;
}
