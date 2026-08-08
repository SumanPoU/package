import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function ProgressBarElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const percentage = Math.min(100, Math.max(0, parseInt(resolved.percentage) || 0));

  return (
    <div style={{ ...st, width: '100%' }} className="flex flex-col gap-2">
      <div className="flex justify-between text-sm font-medium text-gray-700">
        <span>{resolved.label}</span>
        <span className="text-primary">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
