import { Quote } from 'lucide-react';

import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function QuoteElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <blockquote
      style={st}
      className="relative p-6 my-4 rounded-xl border-l-4 border-primary bg-gray-50 shadow-sm"
    >
      <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
      <p className="text-lg italic font-medium leading-relaxed text-gray-800 relative z-10">
        "{resolved.text}"
      </p>
      {resolved.author && (
        <footer className="mt-4 flex items-center gap-3 text-sm font-semibold text-gray-900">
          <div className="h-px w-6 bg-primary" />
          {resolved.author}
        </footer>
      )}
    </blockquote>
  );
}
