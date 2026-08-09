import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";

export const SpacerElement = ({ block, props }: BlockRenderProps) => {
  const height =
    typeof props.height === "string" && props.height.trim()
      ? props.height
      : "24px";
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="spacer"
      style={{ height, width: "100%" }}
      aria-hidden
    />
  );
};

const SpacerContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const height =
    typeof block.props.height === "string" ? block.props.height : "24px";
  return (
    <label className="pb-field">
      <span className="pb-field-label">Height</span>
      <input
        type="text"
        value={height}
        aria-label="Spacer height"
        placeholder="24px"
        onChange={(e) =>
          onChange({
            props: { ...block.props, height: e.target.value.trim() || "24px" },
          })
        }
      />
    </label>
  );
};

export const spacerDefinition: BlockDefinition = {
  type: "spacer",
  label: "Space",
  category: "layout",
  defaultProps: { height: "24px" },
  translatableProps: [],
  sharedProps: ["height"],
  propsSchema: z
    .object({
      height: z.string().optional(),
    })
    .passthrough(),
  render: SpacerElement,
  ContentFields: SpacerContentFields,
  source: "core",
};
