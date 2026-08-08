import type { BlockRegistry } from "../../core/registry";
import type { Block } from "../../core/types";
import {
  type RenderContext,
  resolveVisibility,
} from "../../core/visibilityResolve";

export type OutlineTreeProps = {
  blocks: Block[];
  registry: BlockRegistry;
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderContext: RenderContext;
};

const OutlineNode = ({
  block,
  depth,
  registry,
  selectedId,
  onSelect,
  renderContext,
}: {
  block: Block;
  depth: number;
  registry: BlockRegistry;
  selectedId: string | null;
  onSelect: (id: string) => void;
  renderContext: RenderContext;
}) => {
  const def = registry.get(block.type);
  const visibility = resolveVisibility(block, renderContext, "canvas");
  const dimmed = visibility !== "show";
  const label = def?.label ?? block.type;

  return (
    <div>
      <button
        type="button"
        className="pb-outline-item"
        style={{ paddingLeft: 6 + depth * 12 }}
        data-selected={selectedId === block.id ? "true" : "false"}
        data-dimmed={dimmed ? "true" : "false"}
        aria-current={selectedId === block.id ? "true" : undefined}
        onClick={() => onSelect(block.id)}
      >
        {label}
      </button>
      {block.children?.map((child) => (
        <OutlineNode
          key={child.id}
          block={child}
          depth={depth + 1}
          registry={registry}
          selectedId={selectedId}
          onSelect={onSelect}
          renderContext={renderContext}
        />
      ))}
    </div>
  );
};

export const OutlineTree = ({
  blocks,
  registry,
  selectedId,
  onSelect,
  renderContext,
}: OutlineTreeProps) => (
  <div>
    <h2 className="pb-panel-title">Outline</h2>
    {blocks.map((block) => (
      <OutlineNode
        key={block.id}
        block={block}
        depth={0}
        registry={registry}
        selectedId={selectedId}
        onSelect={onSelect}
        renderContext={renderContext}
      />
    ))}
  </div>
);
