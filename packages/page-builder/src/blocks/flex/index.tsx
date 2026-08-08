import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { FlexContentFields } from "./FlexContentFields";
import { FlexElement } from "./FlexElement";

export const flexDefinition: BlockDefinition = {
  type: "flex",
  label: "Flex",
  category: "layout",
  isContainer: true,
  canAcceptChild: () => true,
  defaultProps: {},
  translatableProps: [],
  sharedProps: [
    "backgroundImage",
    "backgroundSize",
    "backgroundPosition",
    "backgroundRepeat",
  ],
  propsSchema: z
    .object({
      backgroundImage: z.string().optional(),
      backgroundSize: z.string().optional(),
      backgroundPosition: z.string().optional(),
      backgroundRepeat: z.string().optional(),
    })
    .passthrough(),
  render: FlexElement,
  ContentFields: FlexContentFields,
  source: "core",
};
