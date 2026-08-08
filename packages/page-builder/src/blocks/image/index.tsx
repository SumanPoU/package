import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { DEFAULT_IMAGE_SRC } from "./defaultSrc";
import { ImageContentFields } from "./ImageContentFields";
import { ImageElement } from "./ImageElement";

export { DEFAULT_IMAGE_SRC } from "./defaultSrc";

export const imageDefinition: BlockDefinition = {
  type: "image",
  label: "Image",
  category: "basic",
  defaultProps: {
    src: DEFAULT_IMAGE_SRC,
    width: "100%",
    height: "auto",
  },
  defaultI18nProps: { en: { alt: "Image" } },
  translatableProps: ["alt"],
  sharedProps: ["src", "width", "height"],
  propsSchema: z
    .object({
      src: z.string().optional(),
      alt: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
    })
    .passthrough(),
  render: ImageElement,
  ContentFields: ImageContentFields,
  source: "core",
};
