import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function VideoElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  return (
    <div
      style={{ ...st, width: '100%' }}
      className="aspect-video rounded-xl overflow-hidden shadow-sm border border-gray-100"
    >
      <iframe
        className="w-full h-full"
        src={resolved.url}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
