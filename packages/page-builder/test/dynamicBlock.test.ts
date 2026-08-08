import { describe, expect, it } from "vitest";

import {
  createRegistry,
  registerDynamicBlock,
  registerPrimitives,
  resolveTemplateString,
} from "../src/index";
import type { DynamicBlockSpec } from "../src/core/dynamicBlock";

const promoSpec = (): DynamicBlockSpec => ({
  type: "tenant:promo",
  label: "Promo",
  source: "tenant",
  fields: [
    { key: "title", kind: "text", translatable: true, defaultValue: "Hi" },
    { key: "href", kind: "url", defaultValue: "#" },
  ],
  template: [
    {
      type: "heading",
      props: { level: "h2" },
      i18nProps: { en: { title: "{{props.title}}" } },
    },
  ],
});

describe("Model B dynamic blocks (§24.2)", () => {
  it("registers a JSON spec as a namespaced definition", () => {
    const registry = createRegistry();
    registerPrimitives(registry);
    registerDynamicBlock(registry, promoSpec());
    const def = registry.get("tenant:promo");
    expect(def?.label).toBe("Promo");
    expect(def?.source).toBe("tenant");
    expect(def?.translatableProps).toContain("title");
    expect(def?.sharedProps).toContain("href");
  });

  it("rejects unknown field kinds", () => {
    const registry = createRegistry();
    registerPrimitives(registry);
    expect(() =>
      registerDynamicBlock(registry, {
        ...promoSpec(),
        fields: [
          {
            key: "x",
            kind: "magic" as "text",
          },
        ],
      }),
    ).toThrow(/unknown field kind/);
  });

  it("rejects template types not in the registry", () => {
    const registry = createRegistry();
    registerPrimitives(registry);
    expect(() =>
      registerDynamicBlock(registry, {
        ...promoSpec(),
        template: [{ type: "not-a-block" }],
      }),
    ).toThrow(/not a registered primitive/);
  });

  it("honors allowDynamicBlockDefs=false", () => {
    const registry = createRegistry();
    registerPrimitives(registry);
    expect(() =>
      registerDynamicBlock(registry, promoSpec(), {
        allowDynamicBlockDefs: false,
      }),
    ).toThrow(/allowDynamicBlockDefs=false/);
  });

  it("resolves {{props.*}} tokens", () => {
    expect(
      resolveTemplateString("Go {{props.title}}", {
        props: { title: "there" },
      }),
    ).toBe("Go there");
  });
});
