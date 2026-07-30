import type { ComponentType } from "react";

/** Stable ids for captcha example modules. */
export type CaptchaExampleId = "text" | "math" | "slider" | "secure";

/**
 * Where the challenge answer is created and checked.
 * - `client` — browser generates + can verify locally (UX friction)
 * - `server` — API issues prompt; answer stays server-side (trusted)
 */
export type CaptchaTrustModel = "client" | "server";

export type CaptchaExampleMeta = {
  id: CaptchaExampleId;
  trust: CaptchaTrustModel;
  /** Short nav / segmented label */
  label: string;
  /** Docs section title */
  title: string;
  /** Docs section blurb */
  description: string;
  /** Anchor id under #examples */
  sectionId: string;
  /** Package export used */
  component: string;
  /** When to pick this mode */
  recommendedFor: string;
  /** ExampleDemo max height */
  size?: "sm" | "md" | "lg" | "xl";
};

export type CaptchaExampleModule = CaptchaExampleMeta & {
  /** Live interactive preview */
  Example: ComponentType;
  /** Full copy-paste source shown in the Code tab */
  code: string;
};

export const TRUST_MODEL_OPTIONS: {
  id: CaptchaTrustModel;
  label: string;
  summary: string;
}[] = [
  {
    id: "client",
    label: "Client",
    summary:
      "Generate + verify in the browser. Fast UX friction — not a security boundary alone.",
  },
  {
    id: "server",
    label: "Server",
    summary:
      "API issues the prompt; answer never reaches the client. Required for login / checkout / signup.",
  },
];
