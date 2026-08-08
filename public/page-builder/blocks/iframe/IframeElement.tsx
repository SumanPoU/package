import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function IframeElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <div
      style={st}
      className="w-full aspect-[16/9] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400"
    >
      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
      <span className="text-sm">Iframe: {resolved.url}</span>
    </div>
  );
}
