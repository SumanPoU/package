import type { ComponentProps } from "react";

export type CaptchaStatus = "idle" | "valid" | "invalid";

export type CaptchaTheme = "light" | "dark" | "system";

/**
 * What characters appear in the challenge.
 * - `both` — letters + digits (default)
 * - `letters` — A–Z / a–z only
 * - `numbers` — 0–9 only
 */
export type CaptchaCharsetMode = "both" | "letters" | "numbers";

export type CaptchaMessages = {
  placeholder?: string;
  idleHint?: string;
  validHint?: string;
  invalidHint?: string;
  refreshLabel?: string;
};

export type CaptchaHandle = {
  /** Generate a new challenge and clear the input. */
  refresh: () => void;
  /** Clear input + status without regenerating (same challenge). */
  reset: () => void;
  /** Current user input. */
  getValue: () => string;
  /** Whether the current input matches the challenge. */
  validate: () => boolean;
  /** Latest verification status. */
  getStatus: () => CaptchaStatus;
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

  /** Canvas width in CSS pixels (default 210). */
  width?: number;
  /** Canvas height in CSS pixels (default 62). */
  height?: number;
  /** Render theme. `system` follows `prefers-color-scheme` (default). */
  theme?: CaptchaTheme;
  /** Noise / interference intensity 0–1 (default 0.7). */
  noise?: number;

  onVerified?: (valid: boolean) => void;
  onChange?: (value: string) => void;
  onStatusChange?: (status: CaptchaStatus) => void;
  onRefresh?: () => void;

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
  messages?: CaptchaMessages;

  className?: string;
  canvasClassName?: string;
  inputClassName?: string;
  refreshClassName?: string;
  /** Extra props forwarded to the text input. */
  inputProps?: Omit<
    ComponentProps<"input">,
    "value" | "onChange" | "disabled" | "maxLength" | "type"
  >;
};
