import { CORE_PRIMITIVE_TYPES } from "../constants";
import type { BlockRegistry } from "./registry";
import type { BlockDefinition, BlockSource } from "./types";

const NAMESPACE_RE = /^(tenant|plugin):.+/;

export type RegistrationGuardError = {
  code: "duplicate" | "namespace" | "empty" | "core-collision";
  message: string;
};

export type RegistrationGuardResult =
  | { ok: true }
  | { ok: false; error: RegistrationGuardError };

const coreSet = new Set<string>(CORE_PRIMITIVE_TYPES);

/**
 * Namespace + collision checks for non-core block registration (§24).
 * Core primitives use plain ids; tenant/plugin must use `tenant:` / `plugin:`.
 */
export const assertBlockRegistration = (
  definition: BlockDefinition,
  registry: BlockRegistry,
): RegistrationGuardResult => {
  const type = definition.type.trim();
  if (!type) {
    return {
      ok: false,
      error: { code: "empty", message: "type must be a non-empty string" },
    };
  }

  if (registry.has(type)) {
    return {
      ok: false,
      error: {
        code: "duplicate",
        message: `duplicate type "${type}" — refuse to silent-override`,
      },
    };
  }

  if (definition.source === "core") {
    if (NAMESPACE_RE.test(type)) {
      return {
        ok: false,
        error: {
          code: "namespace",
          message: `core block "${type}" must not use tenant:/plugin: prefix`,
        },
      };
    }
    return { ok: true };
  }

  if (!NAMESPACE_RE.test(type)) {
    return {
      ok: false,
      error: {
        code: "namespace",
        message: `non-core type "${type}" must be namespaced as tenant:… or plugin:…`,
      },
    };
  }

  const bare = type.replace(/^(tenant|plugin):/, "");
  if (coreSet.has(bare) || coreSet.has(type)) {
    return {
      ok: false,
      error: {
        code: "core-collision",
        message: `type "${type}" collides with a reserved core primitive`,
      },
    };
  }

  return { ok: true };
};

export const registerBlockGuarded = (
  registry: BlockRegistry,
  definition: BlockDefinition,
): void => {
  const result = assertBlockRegistration(definition, registry);
  if (!result.ok) {
    throw new Error(`registerBlock: ${result.error.message}`);
  }
  registry.register(definition);
};

export const isNamespacedBlockType = (type: string): boolean =>
  NAMESPACE_RE.test(type);

export type { BlockSource };
