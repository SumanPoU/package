import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function MapElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <div
      style={st}
      className="w-full aspect-[21/9] bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400"
    >
      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span className="text-sm">Map of {resolved.address}</span>
    </div>
  );
}
