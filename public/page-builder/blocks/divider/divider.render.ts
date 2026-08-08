import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderDividerToHtml(block: Block, _ctx: ExportContext): string {
  return `<div class="b-${block.id}" style="width:100%"><hr style="width:100%;border:none;border-top:1px solid #e5e7eb;margin:8px 0" /></div>`;
}
