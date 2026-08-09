import {
  boxDefinition,
  imageDefinition,
  quoteDefinition,
  textDefinition,
} from "../blocks";
import { createBlockFromDefinition } from "../core/blockTree";
import type { Block } from "../core/types";
import type { PresetDefinition } from "./types";

/** Quote + attribution (+ optional avatar) — Elementor Testimonial. */
export const createTestimonialPreset = (): Block => {
  const root = createBlockFromDefinition(boxDefinition);
  root.props = { ...root.props, as: "figure" };
  root.customCss = `.element {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
}`;

  const avatar = createBlockFromDefinition(imageDefinition);
  avatar.props = {
    ...avatar.props,
    src: "https://picsum.photos/seed/pb-testi/96/96",
    alt: "Reviewer",
  };
  avatar.customCss = `.element {
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  object-fit: cover;
  display: block;
}`;

  const quote = createBlockFromDefinition(quoteDefinition);
  quote.i18nProps = {
    en: {
      body: "This product changed how we ship pages.",
      cite: "Alex Kim",
    },
    ne: {
      body: "यो उत्पादनले हाम्रो पृष्ठ निर्माण सजिलो बनायो।",
      cite: "एलेक्स किम",
    },
  };

  const byline = createBlockFromDefinition(textDefinition);
  byline.i18nProps = {
    en: { html: "<p><strong>Alex Kim</strong> — Product Lead</p>" },
    ne: { html: "<p><strong>एलेक्स किम</strong> — प्रोडक्ट लिड</p>" },
  };

  root.children = [avatar, quote, byline];
  return root;
};

export const testimonialPreset: PresetDefinition = {
  id: "testimonial",
  label: "Testimonial",
  description: "Avatar, quote, and attribution",
  create: createTestimonialPreset,
};
