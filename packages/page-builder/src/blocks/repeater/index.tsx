import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  Block,
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";

/**
 * Structural loop container (§25). Expansion happens in RenderBlock via
 * dataBinding — this render only wraps expanded (or template) children.
 */
export const RepeaterElement = ({
  block,
  props,
  children,
}: BlockRenderProps) => {
  const state =
    typeof props.bindingState === "string" ? props.bindingState : undefined;
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="repeater"
      data-binding-state={state || undefined}
    >
      {children}
    </div>
  );
};

const RepeaterContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const binding = block.dataBinding ?? {
    sourceId: "sample",
    params: { limit: 6 },
    itemTemplate: [] as Block[],
  };
  return (
    <div className="pb-fields">
      <label className="pb-field">
        <span className="pb-field-label">Data source id</span>
        <input
          type="text"
          value={binding.sourceId}
          aria-label="Data source id"
          onChange={(e) =>
            onChange({
              dataBinding: {
                ...binding,
                sourceId: e.target.value.trim() || "sample",
              },
            })
          }
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Limit</span>
        <input
          type="number"
          min={1}
          max={100}
          value={Number(binding.params.limit ?? 6)}
          aria-label="Item limit"
          onChange={(e) =>
            onChange({
              dataBinding: {
                ...binding,
                params: {
                  ...binding.params,
                  limit: Number(e.target.value) || 6,
                },
              },
            })
          }
        />
      </label>
      <p className="pb-field-hint">
        Template is the repeater’s children. Use tokens like{" "}
        <code>{"{{item.title}}"}</code> in props. Preview/Open expand via host{" "}
        <code>renderContext.dataSources</code>.
      </p>
    </div>
  );
};

export const repeaterDefinition: BlockDefinition = {
  type: "repeater",
  label: "Repeater",
  category: "layout",
  isContainer: true,
  canAcceptChild: () => true,
  defaultProps: {},
  defaultDataBinding: {
    sourceId: "sample",
    params: { limit: 6 },
  },
  translatableProps: [],
  sharedProps: [],
  propsSchema: z.object({}).passthrough(),
  render: RepeaterElement,
  ContentFields: RepeaterContentFields,
  source: "core",
};
