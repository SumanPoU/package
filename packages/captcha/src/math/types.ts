/** Difficulty presets for generated math challenges. */
export type MathDifficulty = "easy" | "medium" | "hard" | "bodmas";

/** Allowed operators when building expressions. */
export type MathOperator = "+" | "-" | "*" | "/";

/**
 * Configurable math-captcha generator options.
 * Defaults stay simple (easy addition); opt into BODMAS with `difficulty: "bodmas"`.
 */
export type MathCaptchaGenerateOptions = {
  difficulty?: MathDifficulty;
  /** Override operator pool (ignored for `easy`, which is `+` only). */
  operators?: readonly MathOperator[];
  /** Inclusive min/max for leaf operands. */
  operandRange?: { min: number; max: number };
  /**
   * Term count (`2` → binary; `3`/`4` → multi-op, may parenthesize).
   * @default from difficulty preset
   */
  termCount?: 2 | 3 | 4;
  /** Prefer integer-only division results (default true). */
  integerDivisionOnly?: boolean;
  /** RNG override (tests / deterministic seeds). */
  random?: () => number;
};

export type MathCaptchaChallenge = {
  /** Display string, e.g. `(7 + 3) × 2 = ?` */
  prompt: string;
  /** Correct numeric answer after BODMAS evaluation. */
  answer: number;
  /** ASCII expression using `+ - * / ( )` (server-safe). */
  expression: string;
  difficulty: MathDifficulty;
  /** Whether the UI should surface a BODMAS caution. */
  requiresBodmas: boolean;
};

export type MathCaptchaVerifyInput = {
  value: string | number;
  answer: number;
  /** Absolute tolerance for float answers (default 0). */
  tolerance?: number;
};

export type MathCaptchaMessages = {
  label?: string;
  placeholder?: string;
  idleHint?: string;
  validHint?: string;
  invalidHint?: string;
  loadingHint?: string;
  errorHint?: string;
  lockedHint?: string;
  refreshLabel?: string;
  verifyLabel?: string;
  /** Shown under the prompt when BODMAS applies. */
  bodmasCaution?: string;
};

export type MathCaptchaHandle = {
  refresh: () => void;
  reset: () => void;
  getValue: () => string;
  getChallengeId: () => string;
  /** Local challenge, or `null` in server-driven mode. */
  getChallenge: () => MathCaptchaChallenge | null;
  validate: () => boolean;
  getStatus: () => import("../types").CaptchaStatus;
  getAttempts: () => number;
  unlock: (opts?: { refresh?: boolean }) => void;
};
