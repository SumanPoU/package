import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { ImageContentFields } from "./ImageContentFields";
import { ImageElement } from "./ImageElement";

export const imageDefinition: BlockDefinition = {
  type: "image",
  label: "Image",
  category: "basic",
  defaultProps: { src: "" },
  defaultI18nProps: { en: { alt: "" } },
  translatableProps: ["alt"],
  sharedProps: ["src"],
  propsSchema: z
    .object({
      src: z.string().optional(),
      alt: z.string().optional(),
    })
    .passthrough(),
  render: ImageElement,
  ContentFields: ImageContentFields,
  source: "core",
};
