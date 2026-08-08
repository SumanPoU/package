import type { Block } from '../../types';
import { buildImageElementStyle, resolveProps } from '../../utils';

export function ImageElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);

  return (
    <img
      src={resolved.src}
      alt={resolved.alt}
      className="w-full h-full rounded-md"
      style={buildImageElementStyle(block.style)}
      draggable={false}
    />
  );
}
