import type { BlockRegistry } from "../core/registry";
import { registerBlock } from "../core/registry";
import { accordionDefinition } from "./accordion";
import { alertDefinition } from "./alert";
import { anchorDefinition } from "./anchor";
import { audioDefinition } from "./audio";
import { badgeDefinition } from "./badge";
import { boxDefinition, containerDefinition } from "./box";
import { buttonDefinition } from "./button";
import { carouselDefinition } from "./carousel";
import { codeDefinition } from "./code";
import { dividerDefinition } from "./divider";
import { embedDefinition } from "./embed";
import { flexDefinition } from "./flex";
import { galleryDefinition } from "./gallery";
import { gridDefinition } from "./grid";
import { headingDefinition } from "./heading";
import { htmlDefinition } from "./html";
import { iconDefinition } from "./icon";
import { iconListDefinition } from "./icon-list";
import { imageDefinition } from "./image";
import { listDefinition } from "./list";
import { mapDefinition } from "./map";
import { quoteDefinition } from "./quote";
import { readMoreDefinition } from "./read-more";
import { repeaterDefinition } from "./repeater";
import { socialIconsDefinition } from "./social-icons";
import { spacerDefinition } from "./spacer";
import { tabsDefinition } from "./tabs";
import { textDefinition } from "./text";
import { toggleDefinition } from "./toggle";
import { videoDefinition } from "./video";

export const PRIMITIVE_DEFINITIONS = [
  boxDefinition,
  containerDefinition,
  flexDefinition,
  gridDefinition,
  headingDefinition,
  textDefinition,
  listDefinition,
  badgeDefinition,
  iconDefinition,
  iconListDefinition,
  imageDefinition,
  galleryDefinition,
  carouselDefinition,
  videoDefinition,
  audioDefinition,
  buttonDefinition,
  dividerDefinition,
  spacerDefinition,
  codeDefinition,
  quoteDefinition,
  alertDefinition,
  tabsDefinition,
  accordionDefinition,
  toggleDefinition,
  socialIconsDefinition,
  anchorDefinition,
  readMoreDefinition,
  repeaterDefinition,
  mapDefinition,
  embedDefinition,
  htmlDefinition,
] as const;

/** Register core layout + content primitives on a registry. */
export const registerPrimitives = (registry: BlockRegistry): void => {
  for (const def of PRIMITIVE_DEFINITIONS) {
    registerBlock(registry, def);
  }
};

export {
  accordionDefinition,
  alertDefinition,
  anchorDefinition,
  audioDefinition,
  badgeDefinition,
  boxDefinition,
  containerDefinition,
  buttonDefinition,
  carouselDefinition,
  codeDefinition,
  dividerDefinition,
  embedDefinition,
  flexDefinition,
  galleryDefinition,
  gridDefinition,
  headingDefinition,
  htmlDefinition,
  iconDefinition,
  iconListDefinition,
  imageDefinition,
  listDefinition,
  mapDefinition,
  quoteDefinition,
  readMoreDefinition,
  repeaterDefinition,
  socialIconsDefinition,
  spacerDefinition,
  tabsDefinition,
  textDefinition,
  toggleDefinition,
  videoDefinition,
};

export { ContainerBackgroundFields } from "./ContainerBackgroundFields";
export { DEFAULT_IMAGE_SRC } from "./image";
export { MediaUrlField } from "./MediaUrlField";
export {
  isGoogleMapsEmbedSrc,
  type ParsedEmbed,
  parseEmbedInput,
  parseGoogleMapsEmbed,
} from "./parseEmbed";
