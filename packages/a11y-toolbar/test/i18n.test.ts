import { afterEach, describe, expect, it, vi } from "vitest";
import {
  collectFallbackPaths,
  deepMergeMessages,
  EN_MESSAGES,
  formatAnnounceStep,
  formatAnnounceToggle,
  listAvailableLocales,
  resolveMessages,
} from "../src/i18n";

describe("resolveMessages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to a full English dictionary", () => {
    const t = resolveMessages({ locale: "en" });
    expect(t.panelTitle).toBe(EN_MESSAGES.panelTitle);
    expect(t.features.textSize.title).toBe("Text Size");
    expect(t.levels.textSize).toHaveLength(4);
  });

  it("merges host locale then messages prop (messages win)", () => {
    const t = resolveMessages({
      locale: "ne",
      locales: {
        ne: {
          localeName: "नेपाली",
          panelTitle: "पहुँच",
          features: { textSize: { title: "अक्षर आकार" } },
        },
      },
      messages: { panelTitle: "Site a11y" },
      warnFallbacks: false,
    });
    expect(t.panelTitle).toBe("Site a11y");
    expect(t.features.textSize.title).toBe("अक्षर आकार");
    expect(t.locale).toBe("ne");
  });

  it("falls back to English for missing keys", () => {
    const t = resolveMessages({
      locale: "ne",
      locales: { ne: { panelTitle: "पहुँच उपकरणहरू" } },
      warnFallbacks: false,
    });
    expect(t.panelTitle).toBe("पहुँच उपकरणहरू");
    expect(t.close).toBe(EN_MESSAGES.close);
  });

  it("lists available locales with en always present", () => {
    expect(listAvailableLocales({ ne: {}, hi: {} })).toEqual([
      "en",
      "ne",
      "hi",
    ]);
    expect(listAvailableLocales({ ne: {} }, ["ne", "en", "ne"])).toEqual([
      "en",
      "ne",
    ]);
  });

  it("formats stepped announces with Arabic numerals", () => {
    const msg = formatAnnounceStep(EN_MESSAGES, "Text Size", "Large", 3, 4);
    expect(msg).toBe("Text Size: Large (3 of 4)");
    expect(msg).toMatch(/\(3 of 4\)/);
  });

  it("formats toggle announces from messages", () => {
    expect(formatAnnounceToggle(EN_MESSAGES, "Reading Guide", true)).toBe(
      "Reading Guide: on",
    );
  });

  it("collects English fallback paths for incomplete locales", () => {
    const merged = deepMergeMessages(EN_MESSAGES, {
      locale: "ne",
      panelTitle: "पहुँच",
    });
    const paths = collectFallbackPaths(merged, EN_MESSAGES, "ne");
    expect(paths).toContain("close");
    expect(paths).not.toContain("panelTitle");
  });

  it("warns in development when translations are incomplete", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    resolveMessages({
      locale: "ne",
      locales: { ne: { panelTitle: "पहुँच" } },
      warnFallbacks: true,
    });
    expect(warn).toHaveBeenCalled();
  });

  it("built-in NE_MESSAGES has no English fallbacks", async () => {
    const { NE_MESSAGES } = await import("../src/i18n/ne");
    const t = resolveMessages({
      locale: "ne",
      locales: { ne: NE_MESSAGES },
      warnFallbacks: false,
    });
    expect(collectFallbackPaths(t, EN_MESSAGES, "ne")).toEqual([]);
    expect(t.features.fontSelection.title).toBe("फन्ट चयन");
    expect(t.levels.saturation[2]).toBe("कुनै होइन");
  });
});

describe("resolveLocaleFont", () => {
  it("uses Outfit for English and Poppins for Nepali by default", async () => {
    const { resolveLocaleFont, DEFAULT_LOCALE_FONTS } = await import(
      "../src/i18n/fonts"
    );
    expect(resolveLocaleFont("en")).toBe(DEFAULT_LOCALE_FONTS.en);
    expect(resolveLocaleFont("ne")).toContain("Poppins");
    expect(resolveLocaleFont("ne")).toContain("--font-poppins");
    expect(resolveLocaleFont("en")).toContain("Noto Sans Devanagari");
    expect(resolveLocaleFont("ne")).toContain("Noto Sans Devanagari");
  });

  it("lets theme.fontFamily force one stack for all locales", async () => {
    const { resolveLocaleFont } = await import("../src/i18n/fonts");
    const forced = '"Custom Sans", sans-serif';
    expect(resolveLocaleFont("ne", { fontFamily: forced })).toBe(forced);
    expect(resolveLocaleFont("en", { fontFamily: forced })).toBe(forced);
  });

  it("lets theme.fontFamilyByLocale override a single locale", async () => {
    const { resolveLocaleFont } = await import("../src/i18n/fonts");
    const ne = '"Host Poppins", sans-serif';
    expect(resolveLocaleFont("ne", { fontFamilyByLocale: { ne } })).toBe(ne);
    expect(resolveLocaleFont("en", { fontFamilyByLocale: { ne } })).toContain(
      "Outfit",
    );
  });
});
