import { CORE_PRIMITIVE_TYPES } from "../constants";
import type { BlockRegistry } from "./registry";
import type { BlockDefinition } from "./types";

const NAMESPACE_RE = /^(tenant|plugin):.+/;

export type RegistrationGuardError = {
  code: "duplicate" | "namespace" | "empty" | "core-collision" | "capability";
  message: string;
};

export type RegistrationGuardResult =
  | { ok: true }
  | { ok: false; error: RegistrationGuardError };

export type RegistrationCapabilities = {
  /** When false, `source: "plugin"` registration is rejected. Default allow. */
  allowRegisterPluginBlocks?: boolean;
  /** When false, `source: "tenant"` registration is rejected. Default allow. */
  allowRegisterTenantBlocks?: boolean;
};

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

/**
 * Capability gate for Model A registration (§24 / §22.8).
 */
export const assertRegistrationCapability = (
  definition: BlockDefinition,
  capabilities?: RegistrationCapabilities,
): RegistrationGuardResult => {
  if (!capabilities) return { ok: true };

  if (
    definition.source === "plugin" &&
    capabilities.allowRegisterPluginBlocks === false
  ) {
    return {
      ok: false,
      error: {
        code: "capability",
        message: `capability allowRegisterPluginBlocks=false — cannot register "${definition.type}"`,
      },
    };
  }

  if (
    definition.source === "tenant" &&
    capabilities.allowRegisterTenantBlocks === false
  ) {
    return {
      ok: false,
      error: {
        code: "capability",
        message: `capability allowRegisterTenantBlocks=false — cannot register "${definition.type}"`,
      },
    };
  }

  return { ok: true };
};

export const registerBlockGuarded = (
  registry: BlockRegistry,
  definition: BlockDefinition,
  capabilities?: RegistrationCapabilities,
): void => {
  const shape = assertBlockRegistration(definition, registry);
  if (!shape.ok) {
    throw new Error(`registerBlock: ${shape.error.message}`);
  }
  const caps = assertRegistrationCapability(definition, capabilities);
  if (!caps.ok) {
    throw new Error(`registerBlock: ${caps.error.message}`);
  }
  registry.register(definition);
};

export const isNamespacedBlockType = (type: string): boolean =>
  NAMESPACE_RE.test(type);
