import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';
import { renderIcon } from '../../elements/basic/_icon';

export function IconElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <div style={st} className="inline-flex items-center justify-center">
      {renderIcon(resolved.iconName || 'Smile', 'w-8 h-8')}
    </div>
  );
}
