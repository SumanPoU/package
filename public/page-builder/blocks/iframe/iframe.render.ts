import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderIframeToHtml(block: Block, _ctx: ExportContext): string {
  return `<div class="b-${block.id}" style="width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:8px">
          <iframe width="100%" height="100%" frameborder="0" style="border:0" src="${block.props.url || ''}" allowfullscreen></iframe>
        </div>`;
}
