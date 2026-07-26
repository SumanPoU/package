import type { CaptchaCharsetMode, CaptchaGenerateOptions } from "./types";

const ALPHA_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHA_LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const LETTERS = ALPHA_UPPER + ALPHA_LOWER;
const DEFAULT_CHARSET = LETTERS + DIGITS;

function pick(pool: string): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? "A";
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function normalizeCaptchaLength(length?: number): number {
  return Math.max(3, Math.min(16, length ?? 6));
}

export function resolveCharsetMode(
  mode?: CaptchaCharsetMode,
): CaptchaCharsetMode {
  return mode ?? "both";
}

export function charsetForMode(mode: CaptchaCharsetMode): string {
  if (mode === "letters") return LETTERS;
  if (mode === "numbers") return DIGITS;
  return DEFAULT_CHARSET;
}

/** Regex that strips disallowed input characters for a mode. */
export function inputSanitizePattern(mode: CaptchaCharsetMode): RegExp {
  if (mode === "letters") return /[^A-Za-z]/g;
  if (mode === "numbers") return /[^0-9]/g;
  return /[^A-Za-z0-9]/g;
}

export function defaultIdleHint(mode: CaptchaCharsetMode): string {
  if (mode === "letters") return "Letters only — match case exactly as shown";
  if (mode === "numbers") return "Digits only — match exactly as shown";
  return "Letters & numbers — match case exactly as shown";
}

/**
 * Build a challenge string with guaranteed character classes when requested.
 */
export function generateCaptcha(options: CaptchaGenerateOptions = {}): string {
  const length = normalizeCaptchaLength(options.length);
  const mode = resolveCharsetMode(options.charsetMode);
  const charset = options.charset?.length
    ? options.charset
    : charsetForMode(mode);

  let requireDigit: number;
  let requireUpper: number;
  let requireLower: number;

  if (mode === "numbers") {
    requireDigit = options.requireDigit ?? length;
    requireUpper = options.requireUpper ?? 0;
    requireLower = options.requireLower ?? 0;
  } else if (mode === "letters") {
    requireDigit = options.requireDigit ?? 0;
    requireUpper = options.requireUpper ?? Math.min(1, length);
    requireLower = options.requireLower ?? Math.min(1, Math.max(0, length - 1));
  } else {
    requireDigit = options.requireDigit ?? Math.min(2, length);
    requireUpper = options.requireUpper ?? Math.min(1, length);
    requireLower = options.requireLower ?? Math.min(1, length);
  }

  requireDigit = Math.max(0, requireDigit);
  requireUpper = Math.max(0, requireUpper);
  requireLower = Math.max(0, requireLower);

  const picks: string[] = [];
  if (mode !== "letters") {
    for (let i = 0; i < requireDigit; i++) picks.push(pick(DIGITS));
  }
  if (mode !== "numbers") {
    for (let i = 0; i < requireUpper; i++) picks.push(pick(ALPHA_UPPER));
    for (let i = 0; i < requireLower; i++) picks.push(pick(ALPHA_LOWER));
  }

  while (picks.length < length) {
    picks.push(pick(charset));
  }

  return shuffle(picks).slice(0, length).join("");
}

export function verifyCaptcha(
  input: string,
  expected: string,
  caseSensitive = true,
): boolean {
  if (input.length !== expected.length) return false;
  if (caseSensitive) return input === expected;
  return input.toLowerCase() === expected.toLowerCase();
}

export { ALPHA_UPPER, ALPHA_LOWER, DIGITS, LETTERS, DEFAULT_CHARSET };
