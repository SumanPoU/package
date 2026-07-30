import type {
  MathCaptchaChallenge,
  MathCaptchaGenerateOptions,
  MathCaptchaVerifyInput,
  MathDifficulty,
  MathOperator,
} from "./types";

function rand(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

const PRESETS: Record<
  MathDifficulty,
  {
    operators: readonly MathOperator[];
    range: { min: number; max: number };
    requiresBodmas: boolean;
    termCount: 2 | 3 | 4;
  }
> = {
  easy: {
    operators: ["+"],
    range: { min: 1, max: 9 },
    requiresBodmas: false,
    termCount: 2,
  },
  medium: {
    operators: ["+", "-"],
    range: { min: 1, max: 40 },
    requiresBodmas: false,
    termCount: 2,
  },
  hard: {
    operators: ["+", "-", "*"],
    range: { min: 2, max: 12 },
    requiresBodmas: true,
    termCount: 3,
  },
  bodmas: {
    operators: ["+", "-", "*", "/"],
    range: { min: 1, max: 9 },
    requiresBodmas: true,
    termCount: 3,
  },
};

/** Display glyph for an ASCII operator. */
export function formatOperator(op: MathOperator): string {
  switch (op) {
    case "*":
      return "×";
    case "/":
      return "÷";
    case "-":
      return "−";
    default:
      return op;
  }
}

/**
 * Evaluate an ASCII math expression with BODMAS / PEMDAS
 * (`*`,`/` before `+`,`-`; parentheses honored).
 */
export function evaluateExpression(expression: string): number {
  const tokens = tokenize(expression);
  const rpn = toRpn(tokens);
  return evalRpn(rpn);
}

type Token =
  | { type: "num"; value: number }
  | { type: "op"; value: MathOperator }
  | { type: "lparen" }
  | { type: "rparen" };

function tokenize(input: string): Token[] {
  const src = input.replace(/\s+/g, "");
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i]!;
    if (ch === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (/\d/.test(ch)) {
      let j = i + 1;
      while (j < src.length && /\d/.test(src[j]!)) j++;
      tokens.push({ type: "num", value: Number(src.slice(i, j)) });
      i = j;
      continue;
    }
    throw new Error(`Unexpected character in expression: ${ch}`);
  }
  return tokens;
}

const PRECEDENCE: Record<MathOperator, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
};

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  for (const t of tokens) {
    if (t.type === "num") {
      output.push(t);
      continue;
    }
    if (t.type === "op") {
      while (stack.length) {
        const top = stack[stack.length - 1]!;
        if (top.type === "op" && PRECEDENCE[top.value] >= PRECEDENCE[t.value]) {
          output.push(stack.pop()!);
        } else break;
      }
      stack.push(t);
      continue;
    }
    if (t.type === "lparen") {
      stack.push(t);
      continue;
    }
    if (t.type === "rparen") {
      while (stack.length && stack[stack.length - 1]!.type !== "lparen") {
        output.push(stack.pop()!);
      }
      if (!stack.length || stack[stack.length - 1]!.type !== "lparen") {
        throw new Error("Mismatched parentheses");
      }
      stack.pop();
    }
  }
  while (stack.length) {
    const t = stack.pop()!;
    if (t.type === "lparen" || t.type === "rparen") {
      throw new Error("Mismatched parentheses");
    }
    output.push(t);
  }
  return output;
}

function evalRpn(tokens: Token[]): number {
  const stack: number[] = [];
  for (const t of tokens) {
    if (t.type === "num") {
      stack.push(t.value);
      continue;
    }
    if (t.type !== "op") throw new Error("Invalid RPN token");
    const b = stack.pop();
    const a = stack.pop();
    if (a == null || b == null) throw new Error("Invalid expression");
    switch (t.value) {
      case "+":
        stack.push(a + b);
        break;
      case "-":
        stack.push(a - b);
        break;
      case "*":
        stack.push(a * b);
        break;
      case "/":
        if (b === 0) throw new Error("Division by zero");
        stack.push(a / b);
        break;
    }
  }
  if (stack.length !== 1) throw new Error("Invalid expression");
  return stack[0]!;
}

function formatPrompt(expression: string): string {
  return `${expression
    .replace(/\*/g, " × ")
    .replace(/\//g, " ÷ ")
    .replace(/-/g, " − ")
    .replace(/\+/g, " + ")
    .replace(/\(/g, "(")
    .replace(/\)/g, ")")
    .replace(/\s+/g, " ")
    .trim()} = ?`;
}

function makeBinary(
  rng: () => number,
  ops: readonly MathOperator[],
  range: { min: number; max: number },
  integerDivisionOnly: boolean,
): { expression: string; answer: number } {
  for (let attempt = 0; attempt < 40; attempt++) {
    const op = pick(rng, ops);
    let a = rand(rng, range.min, range.max);
    let b = rand(rng, range.min, range.max);
    if (op === "-" && b > a) [a, b] = [b, a];
    if (op === "/") {
      if (integerDivisionOnly) {
        b = rand(rng, Math.max(1, range.min), Math.min(9, range.max));
        const q = rand(rng, 1, 9);
        a = b * q;
      } else if (b === 0) {
        b = 1;
      }
    }
    if (op === "*" && (a > 12 || b > 12)) {
      a = rand(rng, 2, 9);
      b = rand(rng, 2, 9);
    }
    const expression = `${a}${op}${b}`;
    const answer = evaluateExpression(expression);
    if (!Number.isFinite(answer)) continue;
    if (integerDivisionOnly && !Number.isInteger(answer)) continue;
    if (answer < 0) continue;
    return { expression, answer };
  }
  return { expression: "2+2", answer: 4 };
}

function makeBodmas(
  rng: () => number,
  ops: readonly MathOperator[],
  range: { min: number; max: number },
  termCount: 3 | 4,
  integerDivisionOnly: boolean,
): { expression: string; answer: number } {
  for (let attempt = 0; attempt < 60; attempt++) {
    const nums = Array.from({ length: termCount }, () =>
      rand(rng, range.min, range.max),
    );
    const operators = Array.from({ length: termCount - 1 }, () =>
      pick(rng, ops),
    );

    // Prefer at least one * or / so BODMAS actually matters vs left-to-right.
    if (!operators.some((o) => o === "*" || o === "/")) {
      operators[rng() < 0.5 ? 0 : operators.length - 1] = "*";
      // keep small factors
      const idx = operators.indexOf("*");
      nums[idx] = rand(rng, 2, 9);
      nums[idx + 1] = rand(rng, 2, 9);
    }

    let expression = String(nums[0]);
    for (let i = 0; i < operators.length; i++) {
      expression += `${operators[i]}${nums[i + 1]}`;
    }

    // Sometimes wrap the first binary pair so order ≠ left-to-right display intuition.
    if (termCount >= 3 && rng() < 0.55) {
      expression = `(${nums[0]}${operators[0]}${nums[1]})${operators[1]}${nums[2]}${
        termCount === 4 ? `${operators[2]}${nums[3]}` : ""
      }`;
    }

    try {
      const answer = evaluateExpression(expression);
      if (!Number.isFinite(answer)) continue;
      if (integerDivisionOnly && !Number.isInteger(answer)) continue;
      if (answer < 0 || answer > 500) continue;
      // Ensure BODMAS differs from naive left-to-right when no parens… skip check if parenthesized
      return { expression, answer };
    } catch {}
  }
  return { expression: "(2+3)*2", answer: 10 };
}

/**
 * Generate a configurable math challenge.
 * Answers are evaluated with BODMAS (`×`/`÷` before `+`/`−`).
 */
export function generateMathChallenge(
  options: MathCaptchaGenerateOptions = {},
): MathCaptchaChallenge {
  const difficulty = options.difficulty ?? "easy";
  const preset = PRESETS[difficulty];
  const rng = options.random ?? Math.random;
  const ops = options.operators ?? preset.operators;
  const range = options.operandRange ?? preset.range;
  const integerDivisionOnly = options.integerDivisionOnly ?? true;
  const termCount = (options.termCount ?? preset.termCount) as 2 | 3 | 4;

  const built =
    difficulty === "bodmas" || termCount >= 3
      ? makeBodmas(
          rng,
          ops,
          range,
          termCount === 2 ? 3 : termCount,
          integerDivisionOnly,
        )
      : makeBinary(rng, ops, range, integerDivisionOnly);

  return {
    prompt: formatPrompt(built.expression),
    answer: built.answer,
    expression: built.expression,
    difficulty,
    requiresBodmas: preset.requiresBodmas || termCount >= 3,
  };
}

/** Compare a user answer to the challenge result. */
export function verifyMathAnswer(input: MathCaptchaVerifyInput): boolean {
  const raw =
    typeof input.value === "number"
      ? input.value
      : Number(String(input.value).trim());
  if (!Number.isFinite(raw)) return false;
  const tol = input.tolerance ?? 0;
  return Math.abs(raw - input.answer) <= tol;
}

export const DEFAULT_BODMAS_CAUTION =
  "Use BODMAS / PEMDAS: Brackets first, then × and ÷ (left to right), then + and −.";
