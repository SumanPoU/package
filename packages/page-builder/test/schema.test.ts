import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  type BlockDefinition,
  createBlockSchema,
  createPageSchema,
  createRegistry,
  localeConfigSchema,
  PAGE_SCHEMA_VERSION,
  pageSchema,
} from "../src/index";

const stub = (type: string): BlockDefinition => ({
  type,
  label: type,
  category: "test",
  defaultProps: {},
  translatableProps: ["title"],
  sharedProps: [],
  propsSchema: z.object({ title: z.string().optional() }).passthrough(),
  render: () => null,
  ContentFields: () => null,
  source: "core",
});

describe("schemas", () => {
  it("parses a valid page", () => {
    const page = pageSchema.parse({
      id: "page-1",
      schemaVersion: PAGE_SCHEMA_VERSION,
      blocks: [
        {
          id: "b1",
          type: "heading",
          props: {},
          i18nProps: { en: { title: "Hi" } },
        },
      ],
      meta: { title: "Demo" },
    });
    expect(page.blocks).toHaveLength(1);
  });

  it("live-refines Block.type against the registry", () => {
    const registry = createRegistry();
    registry.register(stub("heading"));
    const schema = createBlockSchema({ registry });

    expect(schema.parse({ id: "1", type: "heading", props: {} })).toMatchObject(
      { type: "heading" },
    );

    expect(() =>
      schema.parse({ id: "2", type: "unknown-widget", props: {} }),
    ).toThrow(/Unknown block type/);
  });

  it("rejects wrong schemaVersion loudly", () => {
    const schema = createPageSchema({ allowUnknownTypes: true });
    expect(() =>
      schema.parse({
        id: "p",
        schemaVersion: 999,
        blocks: [],
        meta: {},
      }),
    ).toThrow(/Unsupported schemaVersion/);
  });

  it("validates locale config", () => {
    expect(() =>
      localeConfigSchema.parse({
        locales: [
          { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en"] },
        ],
        defaultLocale: "ne",
        fallbackLocale: "en",
        localeStorage: "nested",
      }),
    ).toThrow(/defaultLocale/);
  });
});
