import { describe, expect, it } from "vitest";

import { classifyVerifyFailure, createCaptchaError } from "../src/errors";
import {
  AMBIGUOUS,
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

  it("excludes ambiguous characters by default", () => {
    for (let i = 0; i < 30; i++) {
      const text = generateCaptcha({ length: 8, charsetMode: "both" });
      expect([...text].some((c) => AMBIGUOUS.includes(c))).toBe(false);
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

describe("errors", () => {
  it("creates structured captcha errors", () => {
    const err = createCaptchaError("network", "Network error", {
      attempts: 2,
    });
    expect(err.code).toBe("network");
    expect(err.attempts).toBe(2);
  });

  it("classifies timeout / abort failures", () => {
    expect(
      classifyVerifyFailure(
        Object.assign(new Error("timed out"), { name: "TimeoutError" }),
      ).code,
    ).toBe("timeout");
    expect(
      classifyVerifyFailure(new DOMException("Aborted", "AbortError")).code,
    ).toBe("aborted");
  });
});
