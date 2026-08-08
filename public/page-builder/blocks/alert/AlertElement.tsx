import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function AlertElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const variant = resolved.variant || 'info';

  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  const iconColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
  };

  return (
    <div
      style={st}
      className={cn(
        'p-4 rounded-xl border shadow-sm flex items-start gap-3',
        styles[variant as keyof typeof styles],
      )}
    >
      <AlertTriangle
        className={cn('w-5 h-5 shrink-0 mt-0.5', iconColors[variant as keyof typeof iconColors])}
      />
      <div className="flex-1 text-sm">
        {resolved.title && <h4 className="font-semibold mb-1">{resolved.title}</h4>}
        <p className="opacity-90 leading-relaxed">{resolved.text}</p>
      </div>
    </div>
  );
}
