import type { Block } from '../../types';
import { sanitizeBlockHtml } from '../../lib/sanitizeHtml';
import { getInheritStyle, resolveProps } from '../../utils';

export function TextElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const safe = sanitizeBlockHtml(resolved.text ?? '');
  return (
    <div
      className="prose prose-sm max-w-none text-inherit leading-relaxed m-0"
      style={{ ...st, color: 'inherit' }}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
