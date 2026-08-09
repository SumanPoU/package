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
  defaultProps: {
    direction: "row",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: "16px",
    flexWrap: "nowrap",
    backgroundType: "color",
  },
  translatableProps: [],
  sharedProps: [
    "direction",
    "justifyContent",
    "alignItems",
    "gap",
    "flexWrap",
    "backgroundType",
    "backgroundColor",
    "backgroundImage",
    "backgroundSize",
    "backgroundPosition",
    "backgroundRepeat",
    "backgroundOverlay",
    "backgroundOpacity",
  ],
  propsSchema: z
    .object({
      direction: z.string().optional(),
      justifyContent: z.string().optional(),
      alignItems: z.string().optional(),
      gap: z.string().optional(),
      flexWrap: z.string().optional(),
      backgroundType: z.enum(["color", "image"]).optional(),
      backgroundColor: z.string().optional(),
      backgroundImage: z.string().optional(),
      backgroundSize: z.string().optional(),
      backgroundPosition: z.string().optional(),
      backgroundRepeat: z.string().optional(),
      backgroundOverlay: z.union([z.string(), z.number()]).optional(),
      backgroundOpacity: z.union([z.string(), z.number()]).optional(),
    })
    .passthrough(),
  render: FlexElement,
  ContentFields: FlexContentFields,
  source: "core",
};
