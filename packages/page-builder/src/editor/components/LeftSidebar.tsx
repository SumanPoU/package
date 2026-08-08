import type { BlockRegistry } from "../../core/registry";
import type { Block, Page } from "../../core/types";
import type { RenderContext } from "../../core/visibilityResolve";
import { BlockInspectorPanel } from "./BlockInspectorPanel";
import { ElementsPanel } from "./ElementsPanel";
import { OutlineTree } from "./OutlineTree";

export type LeftSidebarProps = {
  page: Page;
  registry: BlockRegistry;
  selectedId: string | null;
  selectedBlock: Block | null;
  locale: string;
  renderContext: RenderContext;
  leftTab: "elements" | "outline";
  onLeftTabChange: (tab: "elements" | "outline") => void;
  onSelect: (id: string | null) => void;
  onStartDragNew: (type: string, e: React.PointerEvent) => void;
  onInsertType: (type: string) => void;
  onChangeBlock: (id: string, patch: Partial<Block>) => void;
  onRemoveBlock: (id: string) => void;
  allowCustomCss?: boolean;
};

/**
 * CIB-style left rail: Elements / Outline tabs, or inspector when a block is selected.
 */
export const LeftSidebar = ({
  page,
  registry,
  selectedId,
  selectedBlock,
  locale,
  renderContext,
  leftTab,
  onLeftTabChange,
  onSelect,
  onStartDragNew,
  onInsertType,
  onChangeBlock,
  onRemoveBlock,
  allowCustomCss = true,
}: LeftSidebarProps) => {
  if (selectedBlock) {
    return (
      <aside className="pb-sidebar" aria-label="Block inspector">
        <div className="pb-sidebar-back">
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-label="Back to elements"
          >
            ← Elements
          </button>
          <button
            type="button"
            className="pb-sidebar-delete"
            onClick={() => onRemoveBlock(selectedBlock.id)}
            aria-label="Delete block"
          >
            Delete
          </button>
        </div>
        <BlockInspectorPanel
          page={page}
          selectedId={selectedId}
          registry={registry}
          locale={locale}
          onChangeBlock={onChangeBlock}
          allowCustomCss={allowCustomCss}
        />
      </aside>
    );
  }

  return (
    <aside className="pb-sidebar" aria-label="Elements and outline">
      <div className="pb-sidebar-tabs" role="tablist" aria-label="Library">
        <button
          type="button"
          role="tab"
          aria-selected={leftTab === "elements"}
          className={
            leftTab === "elements"
              ? "pb-sidebar-tab pb-sidebar-tab--active"
              : "pb-sidebar-tab"
          }
          onClick={() => onLeftTabChange("elements")}
        >
          Elements
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={leftTab === "outline"}
          className={
            leftTab === "outline"
              ? "pb-sidebar-tab pb-sidebar-tab--active"
              : "pb-sidebar-tab"
          }
          onClick={() => onLeftTabChange("outline")}
        >
          Outline
        </button>
      </div>
      {leftTab === "elements" ? (
        <ElementsPanel
          registry={registry}
          onStartDragNew={onStartDragNew}
          onInsertType={onInsertType}
        />
      ) : (
        <div className="pb-elements-scroll">
          {page.blocks.length === 0 ? (
            <p className="pb-elements-empty">No blocks yet.</p>
          ) : (
            <OutlineTree
              blocks={page.blocks}
              registry={registry}
              selectedId={selectedId}
              onSelect={(id) => onSelect(id)}
              renderContext={renderContext}
            />
          )}
        </div>
      )}
    </aside>
  );
};
