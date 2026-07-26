import { describe, expect, it } from "vitest";

import {
  DIGITS,
  generateCaptcha,
  LETTERS,
  verifyCaptcha,
} from "../src/generate";

describe("generateCaptcha", () => {
  it("respects length / chars count", () => {
    expect(generateCaptcha({ length: 8 })).toHaveLength(8);
    expect(generateCaptcha({ length: 4 })).toHaveLength(4);
  });

  it("defaults to both letters and digits", () => {
    const samples = Array.from({ length: 20 }, () =>
      generateCaptcha({ length: 8, charsetMode: "both" }),
    );
    expect(samples.some((t) => /[A-Za-z]/.test(t))).toBe(true);
    expect(samples.some((t) => /[0-9]/.test(t))).toBe(true);
  });

  it("letters mode has no digits", () => {
    for (let i = 0; i < 10; i++) {
      const text = generateCaptcha({ length: 6, charsetMode: "letters" });
      expect(text).toHaveLength(6);
      expect([...text].every((c) => LETTERS.includes(c))).toBe(true);
      expect([...text].some((c) => DIGITS.includes(c))).toBe(false);
    }
  });

  it("numbers mode has only digits", () => {
    for (let i = 0; i < 10; i++) {
      const text = generateCaptcha({ length: 5, charsetMode: "numbers" });
      expect(text).toHaveLength(5);
      expect([...text].every((c) => DIGITS.includes(c))).toBe(true);
    }
  });
});

describe("verifyCaptcha", () => {
  it("matches case-sensitive by default", () => {
    expect(verifyCaptcha("Ab12Cd", "Ab12Cd")).toBe(true);
    expect(verifyCaptcha("ab12cd", "Ab12Cd")).toBe(false);
  });

  it("can ignore case", () => {
    expect(verifyCaptcha("ab12cd", "Ab12Cd", false)).toBe(true);
  });
});
