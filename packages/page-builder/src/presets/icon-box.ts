import {
  boxDefinition,
  headingDefinition,
  iconDefinition,
  textDefinition,
} from "../blocks";
import { createBlockFromDefinition } from "../core/blockTree";
import type { Block } from "../core/types";
import type { PresetDefinition } from "./types";

/** Icon + heading + text (Elementor Icon Box). */
export const createIconBoxPreset = (): Block => {
  const root = createBlockFromDefinition(boxDefinition);
  root.props = { ...root.props, as: "div" };
  root.customCss = `.element {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-start;
}`;

  const icon = createBlockFromDefinition(iconDefinition);
  icon.props = { ...icon.props, symbol: "★", size: "40px", label: "Feature" };

  const heading = createBlockFromDefinition(headingDefinition);
  heading.props = { ...heading.props, level: "h3" };
  heading.i18nProps = {
    en: { title: "Icon Box" },
    ne: { title: "आइकन बक्स" },
  };

  const text = createBlockFromDefinition(textDefinition);
  text.i18nProps = {
    en: { html: "<p>Short description next to an icon.</p>" },
    ne: { html: "<p>आइकनसँग छोटो विवरण।</p>" },
  };

  root.children = [icon, heading, text];
  return root;
};

export const iconBoxPreset: PresetDefinition = {
  id: "icon-box",
  label: "Icon Box",
  description: "Icon, heading, and text",
  create: createIconBoxPreset,
};
