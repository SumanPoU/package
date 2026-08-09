import {
  type RegistrationCapabilities,
  registerBlockGuarded,
} from "./blockRegistrationGuard";
import type { BlockDefinition } from "./types";

export type BlockRegistry = {
  register: (definition: BlockDefinition) => void;
  get: (type: string) => BlockDefinition | undefined;
  has: (type: string) => boolean;
  list: () => readonly BlockDefinition[];
  types: () => readonly string[];
};

/**
 * In-memory block registry. `Block.type` validation uses live `.refine()`
 * against this map — never a frozen enum of types.
 */
export const createRegistry = (): BlockRegistry => {
  const byType = new Map<string, BlockDefinition>();

  const register = (definition: BlockDefinition): void => {
    if (!definition.type.trim()) {
      throw new Error("registerBlock: type must be a non-empty string");
    }
    if (byType.has(definition.type)) {
      throw new Error(
        `registerBlock: duplicate type "${definition.type}" — refuse to silent-override`,
      );
    }
    byType.set(definition.type, definition);
  };

  return {
    register,
    get: (type) => byType.get(type),
    has: (type) => byType.has(type),
    list: () => Array.from(byType.values()),
    types: () => Array.from(byType.keys()),
  };
};

/**
 * Register a block definition with §24 namespace / collision / capability checks.
 * Prefer this over `registry.register` for host and plugin code.
 */
export const registerBlock = (
  registry: BlockRegistry,
  definition: BlockDefinition,
  capabilities?: RegistrationCapabilities,
): void => {
  registerBlockGuarded(registry, definition, capabilities);
};
