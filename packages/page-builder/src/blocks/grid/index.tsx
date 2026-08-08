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
  render: GridElement,
  ContentFields: GridContentFields,
  source: "core",
};
