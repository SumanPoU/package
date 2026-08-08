import { blockSelector } from "../../core/blockClassName";
import { findBlock } from "../../core/blockTree";
import type { BlockRegistry } from "../../core/registry";
import type { Block, Page } from "../../core/types";

export type BlockInspectorPanelProps = {
  page: Page;
  selectedId: string | null;
  registry: BlockRegistry;
  locale: string;
  onChangeBlock: (id: string, patch: Partial<Block>) => void;
  allowCustomCss?: boolean;
  allowCustomJs?: boolean;
  allowDataBinding?: boolean;
};

/**
 * Minimal package inspector (Content + Advanced custom CSS).
 * Host create shell uses the fuller Content/Style/Advanced panel.
 */
export const BlockInspectorPanel = ({
  page,
  selectedId,
  registry,
  locale,
  onChangeBlock,
  allowCustomCss = true,
  allowCustomJs = true,
  allowDataBinding = true,
}: BlockInspectorPanelProps) => {
  if (!selectedId) {
    return (
      <div>
        <h2 className="pb-panel-title">Inspector</h2>
        <p>Select a block</p>
      </div>
    );
  }

  const block = findBlock(page.blocks, selectedId);
  if (!block) {
    return (
      <div>
        <h2 className="pb-panel-title">Inspector</h2>
        <p>Block not found</p>
      </div>
    );
  }

  const def = registry.get(block.type);
  const ContentFields = def?.ContentFields;

  return (
    <div>
      <h2 className="pb-panel-title">{def?.label ?? block.type}</h2>
      <section aria-label="Content">
        <h3 className="pb-panel-title">Content</h3>
        {ContentFields &&
        !(block.type === "repeater" && !allowDataBinding) ? (
          <ContentFields
            block={block}
            locale={locale}
            onChange={(patch) => onChangeBlock(block.id, patch)}
          />
        ) : block.type === "repeater" && !allowDataBinding ? (
          <p>Data binding is disabled for this workspace.</p>
        ) : (
          <p>No fields for this block.</p>
        )}
      </section>
      {allowCustomCss ? (
        <section aria-label="Advanced" className="pb-field">
          <h3 className="pb-panel-title">Advanced</h3>
          <label htmlFor={`pb-css-${block.id}`}>
            Custom CSS ({blockSelector(block.id)})
            <textarea
              id={`pb-css-${block.id}`}
              rows={8}
              value={block.customCss ?? ""}
              aria-label="Custom CSS"
              placeholder={
                "color: red;\n/* declarations only — or .element { … } */"
              }
              onChange={(e) =>
                onChangeBlock(block.id, { customCss: e.target.value })
              }
            />
          </label>
          <p className="pb-hint">
            Declarations only, or a full rule using <code>.element</code> for{" "}
            {blockSelector(block.id)}.
          </p>
        </section>
      ) : null}
      {allowCustomJs ? (
        <section aria-label="Custom JS" className="pb-field">
          <h3 className="pb-panel-title">Custom JS</h3>
          <p className="pb-hint">
            Author JS is edited in the host Advanced panel when enabled.
          </p>
        </section>
      ) : null}
    </div>
  );
};
