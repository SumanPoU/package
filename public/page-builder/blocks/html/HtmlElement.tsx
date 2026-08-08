import type { Block } from '../../types';
import { sanitizeBlockHtml } from '../../lib/sanitizeHtml';
import { getInheritStyle, resolveProps } from '../../utils';

export function HtmlElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const safe = sanitizeBlockHtml(resolved.code ?? '');

  if (!safe.trim()) {
    return (
      <div
        style={st}
        className="w-full rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400"
      >
        Add HTML in the content panel
      </div>
    );
  }

  return (
    <div
      style={st}
      className="prose prose-sm box-border w-full min-w-0 max-w-full overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
