import type { Block } from "../../core/types";
import type { DragPayload, HoverTarget } from "../hooks/useDragAndDrop";

export type BlockChromeProps = {
  block: Block;
  label: string;
  isContainer: boolean;
  selectedId: string | null;
  drag: DragPayload | null;
  hover: HoverTarget;
  depth: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: (id: string) => void;
  onStartMove: (blockId: string, type: string, e: React.PointerEvent) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
  renderChild: (child: Block, depth: number) => React.ReactNode;
  children: React.ReactNode;
};

/**
 * Editor-only wrapper: selection ring, drag handle, reorder, delete.
 * Dropzone lives inside container render children (CanvasArea).
 */
export const BlockChrome = ({
  block,
  label,
  selectedId,
  drag,
  depth,
  canMoveUp,
  canMoveDown,
  onSelect,
  onStartMove,
  onRemove,
  onMoveUp,
  onMoveDown,
  registerRef,
  children,
}: BlockChromeProps) => {
  const selected = selectedId === block.id;
  const draggingThis = drag?.kind === "move" && drag.blockId === block.id;

  return (
    <div
      ref={(el) => registerRef(block.id, el)}
      className={[
        "pb-block-chrome",
        selected ? "pb-block-chrome--selected" : "",
        draggingThis ? "pb-block-chrome--dragging" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ zIndex: selected ? 10 + depth : undefined }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(block.id);
      }}
    >
      {selected ? (
        <div className="pb-block-toolbar pb-block-toolbar--selected">
          <span className="pb-block-toolbar-label">{label}</span>
          <button
            type="button"
            className="pb-block-toolbar-btn"
            aria-label={`Move ${label} up`}
            disabled={!canMoveUp}
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(block.id);
            }}
          >
            ↑
          </button>
          <button
            type="button"
            className="pb-block-toolbar-btn"
            aria-label={`Move ${label} down`}
            disabled={!canMoveDown}
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(block.id);
            }}
          >
            ↓
          </button>
          <button
            type="button"
            className="pb-block-toolbar-btn"
            aria-label={`Drag ${label}`}
            onPointerDown={(e) => onStartMove(block.id, block.type, e)}
          >
            ⋮⋮
          </button>
          <button
            type="button"
            className="pb-block-toolbar-btn"
            aria-label={`Delete ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(block.id);
            }}
          >
            ×
          </button>
        </div>
      ) : null}
      {children}
    </div>
  );
};
