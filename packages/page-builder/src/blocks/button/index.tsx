import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { ButtonContentFields } from "./ButtonContentFields";
import { ButtonElement } from "./ButtonElement";

export const buttonDefinition: BlockDefinition = {
  type: "button",
  label: "Button",
  category: "basic",
  defaultProps: { href: "" },
  defaultI18nProps: { en: { label: "Button" } },
  translatableProps: ["label"],
  sharedProps: ["href"],
  propsSchema: z
    .object({
      label: z.string().optional(),
      href: z.string().optional(),
    })
    .passthrough(),
  render: ButtonElement,
  ContentFields: ButtonContentFields,
  source: "core",
};
