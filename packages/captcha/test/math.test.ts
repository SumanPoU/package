import { describe, expect, it } from "vitest";

import {
  evaluateExpression,
  generateMathChallenge,
  verifyMathAnswer,
} from "../src/math/generate";

describe("evaluateExpression (BODMAS)", () => {
  it("multiplies before adding", () => {
    expect(evaluateExpression("2+3*4")).toBe(14);
    expect(evaluateExpression("3*4+2")).toBe(14);
  });

  it("honors parentheses", () => {
    expect(evaluateExpression("(2+3)*4")).toBe(20);
    expect(evaluateExpression("2*(3+4)")).toBe(14);
  });

  it("divides before subtracting", () => {
    expect(evaluateExpression("10-8/2")).toBe(6);
  });

  it("left-to-right for same precedence", () => {
    expect(evaluateExpression("8/2*2")).toBe(8);
    expect(evaluateExpression("10-3-2")).toBe(5);
  });
});

describe("generateMathChallenge", () => {
  it("easy is addition of small ints", () => {
    for (let i = 0; i < 20; i++) {
      const c = generateMathChallenge({ difficulty: "easy" });
      expect(c.difficulty).toBe("easy");
      expect(c.requiresBodmas).toBe(false);
      expect(c.expression).toMatch(/^\d+\+\d+$/);
      expect(verifyMathAnswer({ value: c.answer, answer: c.answer })).toBe(
        true,
      );
      expect(evaluateExpression(c.expression)).toBe(c.answer);
    }
  });

  it("bodmas sets requiresBodmas and evaluates consistently", () => {
    for (let i = 0; i < 30; i++) {
      const c = generateMathChallenge({ difficulty: "bodmas" });
      expect(c.requiresBodmas).toBe(true);
      expect(evaluateExpression(c.expression)).toBe(c.answer);
      expect(c.prompt.includes("= ?")).toBe(true);
    }
  });

  it("respects custom operators + termCount", () => {
    const c = generateMathChallenge({
      difficulty: "medium",
      operators: ["+"],
      termCount: 2,
      operandRange: { min: 1, max: 5 },
      random: () => 0.1,
    });
    expect(c.expression.includes("+")).toBe(true);
    expect(evaluateExpression(c.expression)).toBe(c.answer);
  });
});

describe("verifyMathAnswer", () => {
  it("parses string answers", () => {
    expect(verifyMathAnswer({ value: " 42 ", answer: 42 })).toBe(true);
    expect(verifyMathAnswer({ value: "41", answer: 42 })).toBe(false);
    expect(verifyMathAnswer({ value: "abc", answer: 42 })).toBe(false);
  });

  it("supports tolerance", () => {
    expect(verifyMathAnswer({ value: 1.05, answer: 1, tolerance: 0.1 })).toBe(
      true,
    );
    expect(verifyMathAnswer({ value: 1.2, answer: 1, tolerance: 0.1 })).toBe(
      false,
    );
  });
});
