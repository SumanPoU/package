import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { GridContentFields } from "./GridContentFields";
import { GridElement } from "./GridElement";

export const gridDefinition: BlockDefinition = {
  type: "grid",
  label: "Grid",
  category: "layout",
  isContainer: true,
  canAcceptChild: () => true,
  defaultProps: {
    columns: "2",
    gap: "16px",
    alignItems: "stretch",
    justifyItems: "stretch",
    backgroundType: "color",
  },
  translatableProps: [],
  sharedProps: [
    "columns",
    "gap",
    "rowGap",
    "alignItems",
    "justifyItems",
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
      columns: z.union([z.string(), z.number()]).optional(),
      gap: z.string().optional(),
      rowGap: z.string().optional(),
      alignItems: z.string().optional(),
      justifyItems: z.string().optional(),
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
  render: GridElement,
  ContentFields: GridContentFields,
  source: "core",
};
