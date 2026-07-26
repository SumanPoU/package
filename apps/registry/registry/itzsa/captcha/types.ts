import type { ComponentProps } from "react";

export type CaptchaStatus =
  | "idle"
  | "valid"
  | "invalid"
  | "loading"
  | "error"
  | "locked";

export type CaptchaTheme = "light" | "dark" | "system";

/**
 * What characters appear in the challenge.
 * - `both` — letters + digits (default)
 * - `letters` — A–Z / a–z only
 * - `numbers` — 0–9 only
 */
export type CaptchaCharsetMode = "both" | "letters" | "numbers";

/** Structured failure for host APIs / analytics. */
export type CaptchaErrorCode =
  | "invalid"
  | "max_attempts"
  | "verify_failed"
  | "network"
  | "timeout"
  | "aborted"
  | "unknown";

export type CaptchaError = {
  code: CaptchaErrorCode;
  message: string;
  /** How many failed attempts so far (when relevant). */
  attempts?: number;
  /** Original rejection / thrown value from `verify`. */
  cause?: unknown;
};

export type CaptchaVerifyPayload = {
  /** User-entered answer. */
  value: string;
  /** Opaque id for this challenge (correlate with a server session). */
  challengeId: string;
  length: number;
  charsetMode: CaptchaCharsetMode;
};

export type CaptchaMessages = {
  label?: string;
  placeholder?: string;
  idleHint?: string;
  validHint?: string;
  invalidHint?: string;
  loadingHint?: string;
  errorHint?: string;
  lockedHint?: string;
  refreshLabel?: string;
  requiredHint?: string;
};

export type CaptchaHandle = {
  /** Generate a new challenge and clear the input. */
  refresh: () => void;
  /** Clear input + status without regenerating (same challenge). */
  reset: () => void;
  /** Current user input. */
  getValue: () => string;
  /** Current challenge id (for server correlation). */
  getChallengeId: () => string;
  /** Whether the current input matches (local) or last verify succeeded. */
  validate: () => boolean;
  /** Latest verification status. */
  getStatus: () => CaptchaStatus;
  /** Failed attempts since last successful verify / unlock. */
  getAttempts: () => number;
  /** Clear locked / error state and optionally refresh. */
  unlock: (opts?: { refresh?: boolean }) => void;
};

export type CaptchaGenerateOptions = {
  /** Number of characters in the challenge (3–16, default 6). */
  length?: number;
  /** Letters only, numbers only, or both (default). */
  charsetMode?: CaptchaCharsetMode;
  requireDigit?: number;
  requireUpper?: number;
  requireLower?: number;
  /** Override the character pool (skips charsetMode pool when set). */
  charset?: string;
  /** Drop ambiguous glyphs like 0/O/1/l/I (default true). */
  excludeAmbiguous?: boolean;
};

export type CaptchaDrawOptions = {
  theme?: Exclude<CaptchaTheme, "system">;
  /** 0 = clean, 1 = max noise (default ~0.7). */
  noise?: number;
};

export type CaptchaProps = {
  /**
   * Number of characters shown in the captcha (3–16).
   * Alias: `chars`.
   * @default 6
   */
  length?: number;
  /** Alias for `length` — number of captcha characters. */
  chars?: number;

  /**
   * Character set for the challenge.
   * @default "both"
   */
  charsetMode?: CaptchaCharsetMode;
  /** Exact string match including case (default true; ignored for numbers-only). */
  caseSensitive?: boolean;
  requireDigit?: number;
  requireUpper?: number;
  requireLower?: number;
  charset?: string;
  /**
   * Exclude look-alike characters (0/O, 1/l/I).
   * @default true
   */
  excludeAmbiguous?: boolean;

  /** Canvas width in CSS pixels (default 210). */
  width?: number;
  /** Canvas height in CSS pixels (default 62). */
  height?: number;
  /** Render theme. `system` follows `prefers-color-scheme` (default). */
  theme?: CaptchaTheme;
  /** Noise / interference intensity 0–1 (default 0.7). */
  noise?: number;

  /**
   * Optional async / server verification. When provided, local match runs first,
   * then `verify` is awaited. Reject or return `false` for a failed API call.
   */
  verify?: (payload: CaptchaVerifyPayload) => boolean | Promise<boolean>;
  /** Abort / timeout (ms) for `verify`. @default 15000 */
  verifyTimeoutMs?: number;

  /**
   * Max failed attempts before status becomes `locked`.
   * @default 5
   */
  maxAttempts?: number;
  /** Auto-refresh challenge after a local invalid answer. @default false */
  autoRefreshOnInvalid?: boolean;
  /** Auto-refresh after a failed `verify` / API error. @default false */
  autoRefreshOnError?: boolean;

  /**
   * Controlled external / API error message from the host
   * (e.g. login API returned 429 / captcha rejected by server).
   */
  error?: string | null;
  /** Controlled loading flag while a host API is in flight. */
  loading?: boolean;

  onVerified?: (valid: boolean) => void;
  onChange?: (value: string) => void;
  onStatusChange?: (status: CaptchaStatus) => void;
  onRefresh?: () => void;
  /** Fired for invalid answers, max attempts, and verify/API failures. */
  onError?: (error: CaptchaError) => void;
  /** Fired when attempts change (after a failure). */
  onAttemptsChange?: (attempts: number) => void;
  /** Fired when locked after maxAttempts. */
  onLock?: (error: CaptchaError) => void;

  /** Accessible field label. */
  label?: string;
  required?: boolean;

  /** Controlled input value. */
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  name?: string;

  showRefresh?: boolean;
  showCounter?: boolean;
  showStatus?: boolean;
  showLabel?: boolean;
  messages?: CaptchaMessages;

  className?: string;
  canvasClassName?: string;
  inputClassName?: string;
  refreshClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  /** Extra props forwarded to the text input. */
  inputProps?: Omit<
    ComponentProps<"input">,
    "value" | "onChange" | "disabled" | "maxLength" | "type"
  >;
};
