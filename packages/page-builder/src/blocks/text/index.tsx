import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { TextContentFields } from "./TextContentFields";
import { TextElement } from "./TextElement";

export const textDefinition: BlockDefinition = {
  type: "text",
  label: "Text Editor",
  category: "basic",
  defaultProps: {},
  defaultI18nProps: { en: { content: "Paragraph text" } },
  translatableProps: ["content", "html"],
  sharedProps: [],
  propsSchema: z
    .object({
      content: z.string().optional(),
      html: z.string().optional(),
    })
    .passthrough(),
  render: TextElement,
  ContentFields: TextContentFields,
  source: "core",
};
