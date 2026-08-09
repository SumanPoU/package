"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

export const DividerElement = ({ block, props }: BlockRenderProps) => {
  const thickness = asString(props.thickness, "1px") || "1px";
  const color = asString(props.color).trim();
  return (
    <hr
      {...blockRootAttrs(block)}
      data-pb-type="divider"
      style={{
        border: "none",
        borderTop: `${thickness} solid ${color || "currentColor"}`,
        margin: "0.75rem 0",
        width: "100%",
      }}
    />
  );
};

const DividerContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const thickness = asString(block.props.thickness, "1px");
  const color = asString(block.props.color);
  return (
    <div className="pb-content-fields">
      <div className="pb-size-row">
        <label className="pb-field">
          <span className="pb-field-label">Thickness</span>
          <input
            type="text"
            value={thickness}
            placeholder="1px"
            aria-label="Divider thickness"
            onChange={(e) =>
              onChange({
                props: { ...block.props, thickness: e.target.value },
              })
            }
          />
        </label>
        <label className="pb-field">
          <span className="pb-field-label">Color</span>
          <input
            type="text"
            value={color}
            placeholder="currentColor"
            aria-label="Divider color"
            onChange={(e) =>
              onChange({ props: { ...block.props, color: e.target.value } })
            }
          />
        </label>
      </div>
      <p className="pb-hint">Or style further with Custom CSS / author CSS.</p>
    </div>
  );
};

export const dividerDefinition: BlockDefinition = {
  type: "divider",
  label: "Divider",
  category: "layout",
  defaultProps: { thickness: "1px" },
  translatableProps: [],
  sharedProps: ["thickness", "color"],
  propsSchema: z
    .object({
      thickness: z.string().optional(),
      color: z.string().optional(),
    })
    .passthrough(),
  render: DividerElement,
  ContentFields: DividerContentFields,
  source: "core",
};
