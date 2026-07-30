import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ANNOUNCE_RESET, announceStep } from "../src/announce";
import { resolveSpacingVars } from "../src/apply";
import { DEFAULT_PREFERENCES } from "../src/defaults";
import {
  DYSLEXIA_LINE_HEIGHT_LEVEL,
  DYSLEXIA_SPACING_LEVEL,
  LETTER_SPACING_EM,
  LINE_HEIGHT_VALUES,
  SPACING_MAX_LEVEL,
  TEXT_SIZE_ZOOMS,
  WORD_SPACING_EM,
} from "../src/effect-values";
import { resetPreferences } from "../src/preferences";

const cssPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src/styles.css",
);
const stylesCss = readFileSync(cssPath, "utf8");

describe("WCAG 1.4.12 numeric floors (level 3 / max index)", () => {
  it("letter-spacing max ≥ 0.12em", () => {
    expect(LETTER_SPACING_EM[SPACING_MAX_LEVEL]).toBeGreaterThanOrEqual(0.12);
  });

  it("word-spacing max ≥ 0.16em", () => {
    expect(WORD_SPACING_EM[SPACING_MAX_LEVEL]).toBeGreaterThanOrEqual(0.16);
  });

  it("line-height every level ≥ 1.5", () => {
    for (const lh of LINE_HEIGHT_VALUES) {
      expect(lh).toBeGreaterThanOrEqual(1.5);
    }
  });

  it("text size max is 145% (1.45)", () => {
    expect(TEXT_SIZE_ZOOMS[3]).toBe(1.45);
  });
});

describe("Dyslexia Friendly shares spacing source of truth", () => {
  it("uses the same max indices as Text Spacing / Line Height", () => {
    expect(DYSLEXIA_SPACING_LEVEL).toBe(SPACING_MAX_LEVEL);
    expect(DYSLEXIA_LINE_HEIGHT_LEVEL).toBe(SPACING_MAX_LEVEL);
  });

  it("resolveSpacingVars(dyslexia) equals max stepped presets", () => {
    const dyslexia = resolveSpacingVars({
      ...DEFAULT_PREFERENCES,
      dyslexiaFriendly: true,
      textSpacing: 0,
      lineHeight: 0,
    });
    const maxStepped = resolveSpacingVars({
      ...DEFAULT_PREFERENCES,
      textSpacing: SPACING_MAX_LEVEL,
      lineHeight: SPACING_MAX_LEVEL,
    });
    expect(dyslexia).toEqual(maxStepped);
    expect(dyslexia.letterSpacingEm).toBe(LETTER_SPACING_EM[SPACING_MAX_LEVEL]);
    expect(dyslexia.wordSpacingEm).toBe(WORD_SPACING_EM[SPACING_MAX_LEVEL]);
    expect(dyslexia.lineHeight).toBe(LINE_HEIGHT_VALUES[SPACING_MAX_LEVEL]);
  });
});

describe("announce copy", () => {
  it("formats stepped announcements", () => {
    expect(announceStep("textSize", 2)).toBe("Text Size: Large (3 of 4)");
  });

  it("reset announcement is singular", () => {
    expect(ANNOUNCE_RESET).toBe("Preferences reset");
  });
});

describe("CSS contracts (styles.css)", () => {
  it("Bigger Cursor includes required keyword fallback `auto`", () => {
    expect(stylesCss).toMatch(/cursor:\s*var\(--itzsa-a11y-cursor\),\s*auto/s);
  });

  it("Bigger Cursor is not forced back to pointer on toolbar chrome", () => {
    const biggerBlock = stylesCss.slice(
      stylesCss.indexOf("Bigger cursor"),
      stylesCss.indexOf("Pause animations"),
    );
    expect(biggerBlock).not.toMatch(
      /\[data-a11y-toolbar\][\s\S]*cursor:\s*pointer/,
    );
  });

  it("Pause Animations kill-list includes scroll-behavior", () => {
    expect(stylesCss).toMatch(
      /data-a11y-pause-animations[\s\S]*scroll-behavior:\s*auto\s*!important/,
    );
  });

  it("Text Size uses data-a11y-zoom-support feature-detect paths", () => {
    expect(stylesCss).toContain('data-a11y-zoom-support="1"');
    expect(stylesCss).toContain('data-a11y-zoom-support="0"');
    expect(stylesCss).toContain("width: calc(100% / 1.45)");
  });

  it("Hide Images restores informational icons in buttons/links", () => {
    expect(stylesCss).toContain(":is(button, a) svg");
    expect(stylesCss).toContain('svg[role="img"][aria-label]');
  });

  it("Text Align :where() does not include pre/code/td/th", () => {
    const alignBlock = stylesCss.slice(
      stylesCss.indexOf("/* Text align"),
      stylesCss.indexOf("/* Font selection"),
    );
    const whereLists = [...alignBlock.matchAll(/:where\(([^)]+)\)/g)].map(
      (m) => m[1],
    );
    expect(whereLists.length).toBeGreaterThan(0);
    for (const list of whereLists) {
      const tokens = list.split(",").map((t) => t.trim());
      expect(tokens).not.toContain("pre");
      expect(tokens).not.toContain("code");
      expect(tokens).not.toContain("td");
      expect(tokens).not.toContain("th");
    }
  });
});

describe("Hide Images selector fixture (contract)", () => {
  /**
   * Fixture documenting required visibility when Hide Images is on:
   * - decorative <img> → hidden
   * - <svg role="img" aria-label> status icon inside <button> → visible
   *
   * Full computed-style check needs a browser; this asserts the CSS restore
   * rules exist so the fixture stays protected.
   */
  it("CSS restore rules cover button>svg[role=img][aria-label]", () => {
    const fixtureHtml = `
      <div data-a11y-content>
        <img src="/hero.jpg" alt="" />
        <button type="button">
          <svg role="img" aria-label="Status ok"></svg>
          Save
        </button>
      </div>
    `;
    expect(fixtureHtml).toContain('aria-label="Status ok"');
    expect(stylesCss).toMatch(
      /:is\(button,\s*a\)\s*svg[\s\S]*visibility:\s*visible\s*!important/,
    );
    expect(stylesCss).toMatch(
      /svg\[role="img"\]\[aria-label\][\s\S]*visibility:\s*visible\s*!important/,
    );
  });
});

describe("resetPreferences baseline", () => {
  it("matches DEFAULT_PREFERENCES", () => {
    expect(resetPreferences()).toEqual(DEFAULT_PREFERENCES);
  });
});
