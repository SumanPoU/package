import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function StarRatingElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const rating = parseFloat(resolved.rating) || 0;
  const max = parseInt(resolved.maxRating) || 5;

  return (
    <div style={st} className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-5 h-5 transition-colors',
            i < rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200',
          )}
        />
      ))}
    </div>
  );
}
