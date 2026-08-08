import { GripVertical } from 'lucide-react';
import type { DragPayload } from './BlockNode';

export type DragGhostProps = {
  drag: DragPayload;
  pointer: { x: number; y: number };
};

export function DragGhost({ drag, pointer }: DragGhostProps) {
  const label =
    drag.kind === 'new' && 'def' in drag ? drag.def.label : drag.kind === 'move' ? drag.type : '';

  return (
    <div
      className="pointer-events-none fixed z-50 flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 shadow-md"
      style={{ left: pointer.x + 10, top: pointer.y + 10 }}
    >
      <GripVertical className="h-3 w-3 text-gray-400" />
      {label}
    </div>
  );
}
