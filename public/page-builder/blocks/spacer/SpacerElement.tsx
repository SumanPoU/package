import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function SpacerElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const height = resolved.height ? `${resolved.height}px` : '50px';
  return <div style={{ ...st, height, width: '100%' }} />;
}
