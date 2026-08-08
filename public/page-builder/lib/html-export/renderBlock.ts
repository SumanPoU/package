import type { Block } from '../../types';
import { isContainerType } from '../../constants';
import { getBlockDefinition } from '../../core/registry';
import { layoutClassName } from '../blockCss';

function warnUnknownBlockType(type: string, context: 'canvas' | 'export'): void {
  if (import.meta.env.DEV) {
    console.warn(`[page-builder] Skipping unregistered block type "${type}" during ${context}.`);
  }
}

export function renderBlockToHtml(args: { block: Block; lang: string }): string {
  const { block, lang } = args;
  const s = block.style;

  if (isContainerType(block.type)) {
    const inner =
      s.width === 'boxed' ? 'max-width:1280px;margin:0 auto;padding:0 24px' : 'width:100%';
    let heightStyle = '';
    if (s.height === 'full') heightStyle = 'height:100%;';
    else if (s.height === 'custom' && s.customHeight) heightStyle = `height:${s.customHeight}px;`;

    let layoutStyle = inner + ';' + heightStyle;
    if (block.type === 'flex' || block.type === 'container') {
      layoutStyle += `;display:flex;flex-wrap:wrap;`;
      if (s.flexDirection) layoutStyle += `flex-direction:${s.flexDirection};`;
      else if (block.type === 'container') layoutStyle += `flex-direction:column;`;
      if (s.justifyContent) layoutStyle += `justify-content:${s.justifyContent};`;
      if (s.alignItems) layoutStyle += `align-items:${s.alignItems};`;
    } else if (block.type === 'grid') {
      // grid-template-columns comes from collectBlockCssRules (supports tablet/mobile).
      layoutStyle += `;display:grid;`;
    }
    if (block.type === 'flex' || block.type === 'container' || block.type === 'grid') {
      if (s.gap)
        layoutStyle += `gap:${s.gap.row ?? 0}${s.gap.unit} ${s.gap.column ?? 0}${s.gap.unit};`;
      else layoutStyle += `gap:12px;`;
    }

    const children = (block.children ?? [])
      .map((c) => renderBlockToHtml({ block: c, lang }))
      .filter(Boolean)
      .join('\n    ');

    const layoutClass = block.type === 'grid' ? ` class="${layoutClassName(block.id)}"` : '';

    return `<div class="b-${block.id}">\n  <div${layoutClass} style="${layoutStyle}">\n    ${children}\n  </div>\n</div>`;
  }

  const def = getBlockDefinition(block.type);
  if (def) return def.renderToHtml(block, { lang });

  warnUnknownBlockType(block.type, 'export');
  return '';
}
