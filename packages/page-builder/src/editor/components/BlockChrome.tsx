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
  onSelect: (id: string) => void;
  onStartMove: (blockId: string, type: string, e: React.PointerEvent) => void;
  onRemove: (id: string) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
  renderChild: (child: Block, depth: number) => React.ReactNode;
  children: React.ReactNode;
};

/**
 * Editor-only wrapper: selection ring, drag handle, delete.
 * Dropzone lives inside container render children (CanvasArea).
 */
export const BlockChrome = ({
  block,
  label,
  selectedId,
  drag,
  depth,
  onSelect,
  onStartMove,
  onRemove,
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
            aria-label={`Move ${label}`}
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
