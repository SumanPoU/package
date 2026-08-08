import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function BadgeElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <span
      style={st}
      className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/20 shadow-sm"
    >
      {resolved.text}
    </span>
  );
}
