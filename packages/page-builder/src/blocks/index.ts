import type { BlockRegistry } from "../core/registry";
import { registerBlock } from "../core/registry";
import { badgeDefinition } from "./badge";
import { boxDefinition, containerDefinition } from "./box";
import { buttonDefinition } from "./button";
import { codeDefinition } from "./code";
import { dividerDefinition } from "./divider";
import { embedDefinition } from "./embed";
import { flexDefinition } from "./flex";
import { gridDefinition } from "./grid";
import { headingDefinition } from "./heading";
import { htmlDefinition } from "./html";
import { iconDefinition } from "./icon";
import { imageDefinition } from "./image";
import { listDefinition } from "./list";
import { mapDefinition } from "./map";
import { repeaterDefinition } from "./repeater";
import { spacerDefinition } from "./spacer";
import { textDefinition } from "./text";
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
  imageDefinition,
  videoDefinition,
  buttonDefinition,
  dividerDefinition,
  spacerDefinition,
  codeDefinition,
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
  badgeDefinition,
  boxDefinition,
  containerDefinition,
  buttonDefinition,
  codeDefinition,
  dividerDefinition,
  embedDefinition,
  flexDefinition,
  gridDefinition,
  headingDefinition,
  htmlDefinition,
  iconDefinition,
  imageDefinition,
  listDefinition,
  mapDefinition,
  repeaterDefinition,
  spacerDefinition,
  textDefinition,
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
