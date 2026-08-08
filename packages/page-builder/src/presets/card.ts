import {
  boxDefinition,
  buttonDefinition,
  headingDefinition,
  imageDefinition,
  textDefinition,
} from "../blocks";
import { createBlockFromDefinition } from "../core/blockTree";
import type { Block } from "../core/types";
import type { PresetDefinition } from "./types";

/** box → image + heading + text + button */
export const createCardPreset = (): Block => {
  const root = createBlockFromDefinition(boxDefinition);
  root.props = { ...root.props, as: "section" };
  root.customCss = `.element {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
}`;

  const image = createBlockFromDefinition(imageDefinition);
  image.props = {
    ...image.props,
    src: "https://picsum.photos/seed/pb-card/640/360",
    alt: "Card image",
  };
  image.customCss = `.element { width: 100%; height: auto; border-radius: 8px; display: block; }`;

  const heading = createBlockFromDefinition(headingDefinition);
  heading.props = { ...heading.props, level: "h3" };
  heading.i18nProps = {
    en: { title: "Card title" },
    ne: { title: "कार्ड शीर्षक" },
  };

  const text = createBlockFromDefinition(textDefinition);
  text.i18nProps = {
    en: { html: "<p>Short description for this card.</p>" },
    ne: { html: "<p>यस कार्डको छोटो विवरण।</p>" },
  };

  const button = createBlockFromDefinition(buttonDefinition);
  button.props = { ...button.props, href: "#" };
  button.i18nProps = {
    en: { label: "Learn more" },
    ne: { label: "थप जान्नुहोस्" },
  };

  root.children = [image, heading, text, button];
  return root;
};

export const cardPreset: PresetDefinition = {
  id: "card",
  label: "Card",
  description: "Box with image, title, text, and button",
  create: createCardPreset,
};
