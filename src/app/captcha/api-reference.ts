export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const CORE_PROPS: PropRow[] = [
  {
    name: "length / chars",
    type: "number",
    default: "6",
    description: "Number of characters in the challenge (3–16).",
  },
  {
    name: "charsetMode",
    type: '"both" | "letters" | "numbers"',
    default: '"both"',
    description: "Letters + digits, letters only, or digits only.",
  },
  {
    name: "excludeAmbiguous",
    type: "boolean",
    default: "true",
    description: "Drop look-alikes (0 / O / 1 / l / I).",
  },
  {
    name: "caseSensitive",
    type: "boolean",
    default: "true",
    description: "Exact case match (ignored when charsetMode is numbers).",
  },
  {
    name: "theme",
    type: '"light" | "dark" | "system"',
    default: '"system"',
    description: "Canvas color scheme.",
  },
  {
    name: "noise",
    type: "number",
    default: "0.55",
    description: "Interference intensity from 0 to 1.",
  },
  {
    name: "maxAttempts",
    type: "number",
    default: "5",
    description: "Failures before status becomes locked.",
  },
  {
    name: "onVerified",
    type: "(valid: boolean) => void",
    description:
      "Called with true when the answer is accepted, false when cleared / wrong / refreshed. Works with only ref + onVerified.",
  },
];

export const VERIFY_PROPS: PropRow[] = [
  {
    name: "verify",
    type: "(payload) => boolean | Promise<boolean>",
    description:
      "Optional server check. Return false or throw on a bad API call.",
  },
  {
    name: "verifyTimeoutMs",
    type: "number",
    default: "15000",
    description: "Abort verify() after this many milliseconds.",
  },
  {
    name: "error",
    type: "string | null",
    description:
      "Controlled host/API error (e.g. login 429). Shown under the field.",
  },
  {
    name: "loading",
    type: "boolean",
    description: "Controlled loading while a host API is in flight.",
  },
  {
    name: "onError",
    type: "(error: CaptchaError) => void",
    description:
      "Structured failures: invalid, verify_failed, network, timeout, max_attempts, …",
  },
  {
    name: "onLock",
    type: "(error: CaptchaError) => void",
    description: "Fired when maxAttempts is reached.",
  },
  {
    name: "autoRefreshOnInvalid",
    type: "boolean",
    default: "false",
    description: "Issue a new challenge after a wrong answer.",
  },
  {
    name: "autoRefreshOnError",
    type: "boolean",
    default: "false",
    description: "Issue a new challenge after a verify/API failure.",
  },
];

export const CHROME_PROPS: PropRow[] = [
  {
    name: "label / showLabel / required",
    type: "string / boolean / boolean",
    default: '"Security check" / true / false',
    description: "Accessible field label and required marker.",
  },
  {
    name: "messages",
    type: "CaptchaMessages",
    description: "Override placeholders and status copy.",
  },
  {
    name: "showRefresh / showCounter / showStatus",
    type: "boolean",
    default: "true",
    description: "Toggle chrome pieces.",
  },
  {
    name: "className / canvasClassName / inputClassName / …",
    type: "string",
    description:
      "Styling hooks for root, canvas, input, refresh, label, error.",
  },
  {
    name: "value / defaultValue / disabled / id / name",
    type: "—",
    description: "Form control helpers.",
  },
];

export const HANDLE_ROWS: PropRow[] = [
  {
    name: "refresh()",
    type: "() => void",
    description: "New challenge, clear input, reset attempts.",
  },
  {
    name: "reset()",
    type: "() => void",
    description: "Clear input without regenerating the challenge.",
  },
  {
    name: "validate()",
    type: "() => boolean",
    description: "True if currently valid (or local match).",
  },
  {
    name: "getValue()",
    type: "() => string",
    description: "Current user input.",
  },
  {
    name: "getChallengeId()",
    type: "() => string",
    description: "Opaque id for this challenge (server correlation).",
  },
  {
    name: "getStatus() / getAttempts()",
    type: "() => CaptchaStatus / number",
    description: "Latest status and failure count.",
  },
  {
    name: "unlock()",
    type: "(opts?) => void",
    description: "Clear lock; refreshes by default.",
  },
];
