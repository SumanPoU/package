import { resolveProps } from '../../lib/i18nResolve';
import { escapeHtml } from '../../lib/html-export/escapeHtml';
import type { ExportContext } from '../../core/types';
import type { Block } from '../../types';

export function renderCodeToHtml(block: Block, ctx: ExportContext): string {
  const resolved = resolveProps(block, ctx.lang);
  const language = escapeHtml((resolved.language ?? 'plaintext').trim() || 'plaintext');
  const code = escapeHtml(resolved.code ?? '');

  return `<pre class="b-${block.id}" data-language="${language}" style="box-sizing:border-box;margin:0;width:100%;max-width:100%;min-width:0;overflow-x:auto;border-radius:8px;border:1px solid #e5e7eb;background:#030712;padding:16px;text-align:left"><code style="display:block;width:max-content;max-width:none;white-space:pre;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.625;color:#f3f4f6">${code}</code></pre>`;
}
