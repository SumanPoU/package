import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  type BlockDefinition,
  createRegistry,
  registerBlock,
} from "../src/index";

const stubDefinition = (type: string): BlockDefinition => ({
  type,
  label: type,
  category: "test",
  defaultProps: {},
  translatableProps: [],
  sharedProps: [],
  propsSchema: z.object({}).passthrough(),
  render: () => null,
  ContentFields: () => null,
  source: "core",
});

describe("registry", () => {
  it("registers and retrieves definitions", () => {
    const registry = createRegistry();
    registerBlock(registry, stubDefinition("heading"));
    expect(registry.has("heading")).toBe(true);
    expect(registry.get("heading")?.label).toBe("heading");
    expect(registry.types()).toEqual(["heading"]);
  });

  it("throws on duplicate type (no silent override)", () => {
    const registry = createRegistry();
    registry.register(stubDefinition("text"));
    expect(() => registry.register(stubDefinition("text"))).toThrow(
      /duplicate type "text"/,
    );
  });

  it("rejects empty type", () => {
    const registry = createRegistry();
    expect(() => registry.register(stubDefinition("  "))).toThrow(/non-empty/);
  });
});
