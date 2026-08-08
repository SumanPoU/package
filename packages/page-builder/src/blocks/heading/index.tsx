import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { HeadingContentFields } from "./HeadingContentFields";
import { HeadingElement } from "./HeadingElement";

export const headingDefinition: BlockDefinition = {
  type: "heading",
  label: "Heading",
  category: "basic",
  defaultProps: { level: "h2" },
  defaultI18nProps: { en: { title: "Heading" } },
  translatableProps: ["title"],
  sharedProps: ["level"],
  propsSchema: z
    .object({
      level: z.enum(["h1", "h2", "h3", "h4", "h5", "h6"]).optional(),
      title: z.string().optional(),
    })
    .passthrough(),
  render: HeadingElement,
  ContentFields: HeadingContentFields,
  source: "core",
};
