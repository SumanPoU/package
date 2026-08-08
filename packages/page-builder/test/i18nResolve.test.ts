import { describe, expect, it } from "vitest";

import {
  type Block,
  createDefaultLocaleConfig,
  type LocaleConfig,
  normalizeI18n,
  resolveProps,
  serializeI18n,
} from "../src/index";

describe("i18nResolve", () => {
  const config = createDefaultLocaleConfig();

  it("keeps nested i18nProps as canonical", () => {
    const result = normalizeI18n(
      {
        props: { url: "/x" },
        i18nProps: {
          en: { desc: "English" },
          ne: { desc: "नेपाली" },
        },
      },
      config,
    );
    expect(result.props).toEqual({ url: "/x" });
    expect(result.i18nProps.en?.desc).toBe("English");
    expect(result.i18nProps.ne?.desc).toBe("नेपाली");
  });

  it("normalizes flat desc_en / desc_ne (and eng/np aliases)", () => {
    const result = normalizeI18n(
      {
        props: {
          desc_en: "English description",
          desc_ne: "नेपाली विवरण",
          url: "/same",
        },
      },
      config,
    );
    expect(result.props).toEqual({ url: "/same" });
    expect(result.i18nProps).toEqual({
      en: { desc: "English description" },
      ne: { desc: "नेपाली विवरण" },
    });
  });

  it("longest suffix wins (desc_eng before desc_en leftover)", () => {
    const result = normalizeI18n(
      { props: { desc_eng: "via eng", title_np: "शीर्षक" } },
      config,
    );
    expect(result.i18nProps.en?.desc).toBe("via eng");
    expect(result.i18nProps.ne?.title).toBe("शीर्षक");
  });

  it("nested wins over flat for the same locale+key", () => {
    const result = normalizeI18n(
      {
        props: { desc_en: "flat" },
        i18nProps: { en: { desc: "nested" } },
      },
      config,
    );
    expect(result.i18nProps.en?.desc).toBe("nested");
    expect(result.warnings).toEqual([]);
  });

  it("collision prefers first-listed flatSuffix and warns", () => {
    const result = normalizeI18n(
      {
        props: {
          desc_eng: "from eng",
          desc_en: "from en",
        },
      },
      config,
    );
    // flatSuffixes: ['en', 'eng'] — index 0 ('en') wins
    expect(result.i18nProps.en?.desc).toBe("from en");
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.keptKey).toBe("desc_en");
    expect(result.warnings[0]?.droppedKey).toBe("desc_eng");
  });

  it("strictFlatKeys rejects unknown suffixes", () => {
    const strict: LocaleConfig = { ...config, strictFlatKeys: true };
    expect(() => normalizeI18n({ props: { desc_xx: "nope" } }, strict)).toThrow(
      /unknown flat suffix/,
    );
  });

  it("resolveProps falls back missing locale; empty string is not missing", () => {
    const block: Block = {
      id: "1",
      type: "text",
      props: { href: "#" },
      i18nProps: {
        en: { title: "Hello", body: "" },
        ne: { title: "नमस्ते" },
      },
    };

    expect(resolveProps(block, "ne", config)).toEqual({
      href: "#",
      title: "नमस्ते",
      body: "",
    });

    expect(resolveProps(block, "hi" as string, config)).toEqual({
      href: "#",
      title: "Hello",
      body: "",
    });
  });

  it("serializeI18n writes nested or canonical flat suffixes", () => {
    const i18nProps = {
      en: { desc: "English" },
      ne: { desc: "नेपाली" },
    };

    expect(serializeI18n(i18nProps, config)).toEqual({
      props: {},
      i18nProps,
    });

    const flat = serializeI18n(i18nProps, {
      ...config,
      localeStorage: "flat",
    });
    expect(flat).toEqual({
      props: {
        desc_en: "English",
        desc_ne: "नेपाली",
      },
    });
  });

  it("supports host-added locales without engine changes", () => {
    const withHi: LocaleConfig = {
      ...config,
      locales: [
        ...config.locales,
        { code: "hi", label: "हिन्दी", dir: "ltr", flatSuffixes: ["hi"] },
      ],
    };
    const result = normalizeI18n({ props: { title_hi: "नमस्ते" } }, withHi);
    expect(result.i18nProps.hi?.title).toBe("नमस्ते");
  });
});
