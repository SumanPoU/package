import { describe, expect, it } from "vitest";

import { PAGE_SCHEMA_VERSION } from "../src/constants";
import {
  createEnglishOnlyLocaleConfig,
  createLocaleConfig,
  createNepaliOnlyLocaleConfig,
} from "../src/core/localePresets";
import type { Page } from "../src/core/types";
import { validateAuthorCode } from "../src/core/validateAuthorCode";

const basePage = (): Page => ({
  id: "p1",
  schemaVersion: PAGE_SCHEMA_VERSION,
  revision: "1",
  meta: { title: "t" },
  blocks: [],
});

describe("validateAuthorCode", () => {
  it("accepts a clean page", () => {
    const result = validateAuthorCode(basePage());
    expect(result.ok).toBe(true);
    expect(result.cssErrors).toEqual([]);
    expect(result.jsErrors).toEqual([]);
  });

  it("rejects @import in globalCss", () => {
    const page = basePage();
    page.globalCss =
      '@import url("https://evil.example/x.css"); body { color: red; }';
    const result = validateAuthorCode(page);
    expect(result.ok).toBe(false);
    expect(result.cssErrors.some((m) => m.includes("@import"))).toBe(true);
  });

  it("rejects malformed customJs", () => {
    const page = basePage();
    page.globalJs = {
      code: "console.log(1)",
      runAt: "nope",
      enabled: true,
    } as never;
    const result = validateAuthorCode(page);
    expect(result.ok).toBe(false);
    expect(result.jsErrors.length).toBeGreaterThan(0);
  });
});

describe("locale presets", () => {
  it("english only", () => {
    const cfg = createEnglishOnlyLocaleConfig();
    expect(cfg.locales).toHaveLength(1);
    expect(cfg.defaultLocale).toBe("en");
  });

  it("nepali only", () => {
    const cfg = createNepaliOnlyLocaleConfig();
    expect(cfg.locales[0]?.code).toBe("ne");
  });

  it("createLocaleConfig is dynamic", () => {
    const cfg = createLocaleConfig([
      { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en"] },
      { code: "hi", label: "Hindi", dir: "ltr", flatSuffixes: ["hi"] },
    ]);
    expect(cfg.locales.map((l) => l.code)).toEqual(["en", "hi"]);
  });
});
