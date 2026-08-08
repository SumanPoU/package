import { resolveProps } from '../../lib/i18nResolve';
import { getListRenderConfig, parseListItems } from '../../constants/listTypes';
import type { Block } from '../../types';
import type { ExportContext } from '../../core/types';

export function renderListToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const { tag, listStyleType } = getListRenderConfig(resolved.listType);
  const items = parseListItems(resolved.items)
    .map((i) => `<li>${i}</li>`)
    .join('\n      ');
  return `<${tag} class="b-${block.id}" style="padding-left:20px;font-size:0.95rem;line-height:1.8;margin:0;text-align:left;list-style-type:${listStyleType}">\n      ${items}\n    </${tag}>`;
}
