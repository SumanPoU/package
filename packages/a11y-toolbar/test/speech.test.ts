import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_PREFERENCES } from "../src/defaults";
import { A11Y_FEATURE_REGISTRY } from "../src/registry";
import {
  clampSpeechRate,
  SPEECH_RATE_DEFAULT,
  SPEECH_RATE_MAX,
  SPEECH_RATE_MIN,
} from "../src/speech";
import { normalizePreferences } from "../src/storage";

const stylesCss = readFileSync(join(__dirname, "../src/styles.css"), "utf8");

describe("readAloud / speechRate", () => {
  it("is registered as a motion-assist toggle", () => {
    const def = A11Y_FEATURE_REGISTRY.find((f) => f.id === "readAloud");
    expect(def?.kind).toBe("toggle");
    expect(def?.section).toBe("motion-assist");
  });

  it("defaults speechRate to 1 and readAloud off", () => {
    expect(DEFAULT_PREFERENCES.readAloud).toBe(false);
    expect(DEFAULT_PREFERENCES.speechRate).toBe(SPEECH_RATE_DEFAULT);
  });

  it("clamps speechRate to 0.5–2 in 0.1 steps", () => {
    expect(clampSpeechRate(0.1)).toBe(SPEECH_RATE_MIN);
    expect(clampSpeechRate(9)).toBe(SPEECH_RATE_MAX);
    expect(clampSpeechRate(1.24)).toBe(1.2);
    expect(clampSpeechRate("nope")).toBe(SPEECH_RATE_DEFAULT);
  });

  it("normalizePreferences persists speechRate", () => {
    expect(normalizePreferences({ speechRate: 1.7 }).speechRate).toBe(1.7);
    expect(normalizePreferences({ speechRate: 99 }).speechRate).toBe(
      SPEECH_RATE_MAX,
    );
    expect(normalizePreferences({ readAloud: 1 }).readAloud).toBe(true);
  });

  it("CSS scopes click affordance under data-a11y-read-aloud", () => {
    expect(stylesCss).toContain('data-a11y-read-aloud="1"');
    expect(stylesCss).toMatch(/data-a11y-read-aloud[\s\S]*:is\(p,\s*h1,\s*h2/);
  });
});
