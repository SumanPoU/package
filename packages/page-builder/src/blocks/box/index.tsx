import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { BoxContentFields } from "./BoxContentFields";
import { BoxElement } from "./BoxElement";

const propsSchema = z
  .object({
    backgroundImage: z.string().optional(),
    backgroundSize: z.string().optional(),
    backgroundPosition: z.string().optional(),
    backgroundRepeat: z.string().optional(),
    as: z.enum(["div", "section"]).optional(),
  })
  .passthrough();

const sharedProps = [
  "backgroundImage",
  "backgroundSize",
  "backgroundPosition",
  "backgroundRepeat",
  "as",
];

export const boxDefinition: BlockDefinition = {
  type: "box",
  label: "Box",
  category: "layout",
  isContainer: true,
  canAcceptChild: () => true,
  defaultProps: {},
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
  label: "Container",
};
