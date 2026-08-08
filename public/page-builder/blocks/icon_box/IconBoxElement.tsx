import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';
import { renderIcon } from '../../elements/basic/_icon';

export function IconBoxElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <div
      style={st}
      className="flex flex-col items-center text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
        {renderIcon(resolved.iconName || 'Star', 'w-8 h-8')}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{resolved.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{resolved.description}</p>
    </div>
  );
}
