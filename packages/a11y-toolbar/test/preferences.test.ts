import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES } from "../src/defaults";
import { getA11yFoucScript } from "../src/fouc-script";
import {
  cycleStep,
  isPreferencesEqual,
  resetPreferences,
  toggleFeature,
} from "../src/preferences";
import { normalizePreferences } from "../src/storage";

describe("normalizePreferences", () => {
  it("returns defaults for invalid input", () => {
    expect(normalizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(normalizePreferences("x")).toEqual(DEFAULT_PREFERENCES);
  });

  it("clamps stepped values", () => {
    expect(
      normalizePreferences({ textSize: 99, highContrast: -1 }).textSize,
    ).toBe(3);
    expect(normalizePreferences({ highContrast: -1 }).highContrast).toBe(0);
  });

  it("coerces toggles", () => {
    expect(normalizePreferences({ hideImages: 1 }).hideImages).toBe(true);
    expect(normalizePreferences({ pauseAnimations: 0 }).pauseAnimations).toBe(
      false,
    );
  });
});

describe("preference helpers", () => {
  it("cycles steps with wrap", () => {
    let p = resetPreferences();
    p = cycleStep(p, "textSize");
    expect(p.textSize).toBe(1);
    p = cycleStep(p, "textSize");
    p = cycleStep(p, "textSize");
    p = cycleStep(p, "textSize");
    expect(p.textSize).toBe(0);
  });

  it("toggles booleans", () => {
    const p = toggleFeature(resetPreferences(), "hideImages");
    expect(p.hideImages).toBe(true);
  });

  it("compares equality", () => {
    expect(
      isPreferencesEqual(resetPreferences(), { ...DEFAULT_PREFERENCES }),
    ).toBe(true);
    expect(
      isPreferencesEqual(resetPreferences(), {
        ...DEFAULT_PREFERENCES,
        textSize: 1,
      }),
    ).toBe(false);
  });
});

describe("getA11yFoucScript", () => {
  it("embeds the storage key and html attrs", () => {
    const script = getA11yFoucScript("my-key");
    expect(script).toContain('"my-key"');
    expect(script).toContain("data-a11y-text-size");
    expect(script).toContain("data-a11y-pause-animations");
  });
});
