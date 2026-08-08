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

/** section box → heading + text + button + image */
export const createHeroPreset = (): Block => {
  const root = createBlockFromDefinition(boxDefinition);
  root.props = { ...root.props, as: "section" };
  root.customCss = `.element {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 1.5rem;
  padding: 2.5rem 1.5rem;
  align-items: center;
}
@media (max-width: 767px) {
  .element { grid-template-columns: 1fr; }
}`;

  const copy = createBlockFromDefinition(boxDefinition);
  copy.customCss = `.element { display: flex; flex-direction: column; gap: 0.75rem; }`;

  const heading = createBlockFromDefinition(headingDefinition);
  heading.props = { ...heading.props, level: "h1" };
  heading.i18nProps = {
    en: { title: "Build pages visually" },
    ne: { title: "पृष्ठ दृश्यात्मक रूपमा बनाउनुहोस्" },
  };

  const text = createBlockFromDefinition(textDefinition);
  text.i18nProps = {
    en: {
      html: "<p>Compose from primitives. Style with your own CSS.</p>",
    },
    ne: {
      html: "<p>प्रिमिटिभबाट रचना गर्नुहोस्। आफ्नै CSS ले शैली दिनुहोस्।</p>",
    },
  };

  const button = createBlockFromDefinition(buttonDefinition);
  button.props = { ...button.props, href: "#" };
  button.i18nProps = {
    en: { label: "Get started" },
    ne: { label: "सुरु गर्नुहोस्" },
  };

  copy.children = [heading, text, button];

  const image = createBlockFromDefinition(imageDefinition);
  image.props = {
    ...image.props,
    src: "https://picsum.photos/seed/pb-hero/800/600",
    alt: "Hero image",
  };
  image.customCss = `.element { width: 100%; height: auto; border-radius: 12px; display: block; }`;

  root.children = [copy, image];
  return root;
};

export const heroPreset: PresetDefinition = {
  id: "hero",
  label: "Hero",
  description: "Section with headline, copy, CTA, and image",
  create: createHeroPreset,
};
