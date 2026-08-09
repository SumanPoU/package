import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { BoxContentFields } from "./BoxContentFields";
import { BoxElement } from "./BoxElement";

const propsSchema = z
  .object({
    backgroundType: z.enum(["color", "image"]).optional(),
    backgroundColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    backgroundSize: z.string().optional(),
    backgroundPosition: z.string().optional(),
    backgroundRepeat: z.string().optional(),
    backgroundOverlay: z.union([z.string(), z.number()]).optional(),
    backgroundOpacity: z.union([z.string(), z.number()]).optional(),
    as: z.enum(["div", "section"]).optional(),
  })
  .passthrough();

const sharedProps = [
  "backgroundType",
  "backgroundColor",
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "backgroundOverlay",
  "backgroundOpacity",
  "as",
];

export const boxDefinition: BlockDefinition = {
  type: "box",
  label: "Inner Section",
  category: "layout",
  isContainer: true,
  canAcceptChild: () => true,
  defaultProps: { backgroundType: "color" },
  translatableProps: [],
  sharedProps,
  propsSchema,
  render: BoxElement,
  ContentFields: BoxContentFields,
  source: "core",
};

/** Alias of `box` — same render / fields contract. */
export const containerDefinition: BlockDefinition = {
  ...boxDefinition,
  type: "container",
  label: "Section",
};
