import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function CounterElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <div
      style={st}
      className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
    >
      <div className="text-4xl font-extrabold text-primary tracking-tight mb-2">
        {resolved.targetNumber}
      </div>
      <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
        {resolved.label}
      </div>
    </div>
  );
}
