import type { BlockRegistry } from "../core/registry";
import { registerBlock } from "../core/registry";
import { boxDefinition, containerDefinition } from "./box";
import { buttonDefinition } from "./button";
import { flexDefinition } from "./flex";
import { gridDefinition } from "./grid";
import { headingDefinition } from "./heading";
import { imageDefinition } from "./image";
import { textDefinition } from "./text";

export const PRIMITIVE_DEFINITIONS = [
  boxDefinition,
  containerDefinition,
  flexDefinition,
  gridDefinition,
  headingDefinition,
  textDefinition,
  imageDefinition,
  buttonDefinition,
] as const;

/** Register core layout + content primitives on a registry. */
export const registerPrimitives = (registry: BlockRegistry): void => {
  for (const def of PRIMITIVE_DEFINITIONS) {
    registerBlock(registry, def);
  }
};

export {
  boxDefinition,
  containerDefinition,
  buttonDefinition,
  flexDefinition,
  gridDefinition,
  headingDefinition,
  imageDefinition,
  textDefinition,
};
