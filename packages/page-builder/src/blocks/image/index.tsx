import { z } from "zod";

import type { BlockDefinition } from "../../core/types";
import { DEFAULT_IMAGE_SRC } from "./defaultSrc";
import { ImageContentFields } from "./ImageContentFields";
import { ImageElement } from "./ImageElement";

export { DEFAULT_IMAGE_SRC } from "./defaultSrc";

export const imageDefinition: BlockDefinition = {
  type: "image",
  label: "Image",
  category: "other",
  defaultProps: {
    src: DEFAULT_IMAGE_SRC,
    contentWidth: "large",
    width: "100%",
    height: "auto",
  },
  defaultI18nProps: { en: { alt: "Image" }, ne: { alt: "तस्बिर" } },
  translatableProps: ["alt"],
  sharedProps: [
    "src",
    "contentWidth",
    "width",
    "height",
    "href",
    "openInNewWindow",
    "nofollow",
  ],
  propsSchema: z
    .object({
      src: z.string().optional(),
      alt: z.string().optional(),
      contentWidth: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
      href: z.string().optional(),
      openInNewWindow: z.boolean().optional(),
      nofollow: z.boolean().optional(),
    })
    .passthrough(),
  render: ImageElement,
  ContentFields: ImageContentFields,
  source: "core",
};
