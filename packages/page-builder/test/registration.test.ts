import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  assertBlockRegistration,
  assertRegistrationCapability,
  type BlockDefinition,
  createRegistry,
  registerBlock,
  registerBlockGuarded,
} from "../src/index";

const stub = (
  type: string,
  source: BlockDefinition["source"] = "core",
): BlockDefinition => ({
  type,
  label: type,
  category: "test",
  defaultProps: {},
  translatableProps: [],
  sharedProps: [],
  propsSchema: z.object({}).passthrough(),
  render: () => null,
  ContentFields: () => null,
  source,
});

describe("Model A registration (§24)", () => {
  it("allows namespaced tenant blocks", () => {
    const registry = createRegistry();
    registerBlock(registry, stub("tenant:callout", "tenant"));
    expect(registry.has("tenant:callout")).toBe(true);
  });

  it("rejects non-namespaced tenant types", () => {
    const registry = createRegistry();
    expect(() => registerBlock(registry, stub("callout", "tenant"))).toThrow(
      /must be namespaced/,
    );
  });

  it("rejects tenant type that collides with core bare id", () => {
    const registry = createRegistry();
    expect(() =>
      registerBlock(registry, stub("tenant:heading", "tenant")),
    ).toThrow(/collides with a reserved core/);
  });

  it("rejects core types that use a namespace prefix", () => {
    const registry = createRegistry();
    const result = assertBlockRegistration(
      stub("tenant:weird", "core"),
      registry,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("namespace");
  });

  it("gates plugin registration via capabilities", () => {
    const registry = createRegistry();
    expect(() =>
      registerBlockGuarded(registry, stub("plugin:vendor.widget", "plugin"), {
        allowRegisterPluginBlocks: false,
      }),
    ).toThrow(/allowRegisterPluginBlocks=false/);
  });

  it("assertRegistrationCapability allows when unset", () => {
    const result = assertRegistrationCapability(stub("plugin:x", "plugin"));
    expect(result.ok).toBe(true);
  });
});
