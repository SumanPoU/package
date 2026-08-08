import type { Block } from '../../types';
import { getInheritStyle } from '../../utils';

export function DividerElement({ block }: { block: Block; lang: string }) {
  const st = getInheritStyle(block.style);
  return (
    <div style={{ ...st, width: '100%' }}>
      <hr className="w-full border-t border-gray-200 my-2" />
    </div>
  );
}
