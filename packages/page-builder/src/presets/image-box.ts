import {
  boxDefinition,
  headingDefinition,
  imageDefinition,
  textDefinition,
} from "../blocks";
import { createBlockFromDefinition } from "../core/blockTree";
import type { Block } from "../core/types";
import type { PresetDefinition } from "./types";

/** Image + heading + text (Elementor Image Box). */
export const createImageBoxPreset = (): Block => {
  const root = createBlockFromDefinition(boxDefinition);
  root.props = { ...root.props, as: "div" };
  root.customCss = `.element {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}`;

  const image = createBlockFromDefinition(imageDefinition);
  image.props = {
    ...image.props,
    src: "https://picsum.photos/seed/pb-ibox/480/280",
    alt: "Image box",
  };
  image.customCss = `.element { width: 100%; height: auto; display: block; }`;

  const heading = createBlockFromDefinition(headingDefinition);
  heading.props = { ...heading.props, level: "h3" };
  heading.i18nProps = {
    en: { title: "Image Box" },
    ne: { title: "छवि बक्स" },
  };

  const text = createBlockFromDefinition(textDefinition);
  text.i18nProps = {
    en: { html: "<p>Caption or supporting copy under the image.</p>" },
    ne: { html: "<p>छवि मुनिको छोटो विवरण।</p>" },
  };

  root.children = [image, heading, text];
  return root;
};

export const imageBoxPreset: PresetDefinition = {
  id: "image-box",
  label: "Image Box",
  description: "Image, heading, and text",
  create: createImageBoxPreset,
};
