export type DragPayload =
  | { kind: "new"; type: string; label: string }
  | { kind: "move"; blockId: string; type: string };

export type DragGhostProps = {
  drag: DragPayload;
  pointer: { x: number; y: number };
};

/** Floating label that follows the pointer while dragging (parent chrome). */
export const DragGhost = ({ drag, pointer }: DragGhostProps) => {
  const label = drag.kind === "new" ? drag.label : drag.type;
  return (
    <div
      className="pb-drag-ghost"
      style={{ left: pointer.x + 10, top: pointer.y + 10 }}
      aria-hidden
    >
      {label}
    </div>
  );
};
