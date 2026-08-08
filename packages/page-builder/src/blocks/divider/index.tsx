import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";

export const DividerElement = ({ block }: BlockRenderProps) => (
  <hr {...blockRootAttrs(block)} data-pb-type="divider" />
);

const DividerContentFields = (_props: BlockContentFieldsProps) => (
  <p className="pb-field-hint">Horizontal rule — style with Custom CSS.</p>
);

export const dividerDefinition: BlockDefinition = {
  type: "divider",
  label: "Divider",
  category: "layout",
  defaultProps: {},
  translatableProps: [],
  sharedProps: [],
  propsSchema: z.object({}).passthrough(),
  render: DividerElement,
  ContentFields: DividerContentFields,
  source: "core",
};
