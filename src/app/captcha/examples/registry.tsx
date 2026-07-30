"use client";

import { MATH_EXAMPLE_CODE } from "./math/code";
import { MathCaptchaExample } from "./math/example";
import { SECURE_CLIENT_CODE } from "./secure/code";
import { SecureMathCaptchaExample } from "./secure/example";
import { SLIDER_EXAMPLE_CODE } from "./slider/code";
import { SliderCaptchaExample } from "./slider/example";
import { TEXT_EXAMPLE_CODE } from "./text/code";
import { TextCaptchaExample } from "./text/example";
import type { CaptchaExampleId, CaptchaExampleModule } from "./types";

/**
 * Single source of truth for captcha docs examples.
 * Filtered by trust model (client vs server) in the playground.
 */
export const CAPTCHA_EXAMPLES: readonly CaptchaExampleModule[] = [
  {
    id: "text",
    trust: "client",
    label: "Text",
    title: "Client · Text (canvas)",
    description:
      "Browser generates the canvas string and can verify locally. Optional verify() callback for an extra host check.",
    sectionId: "example-text",
    component: "Captcha",
    recommendedFor: "Low-risk forms, newsletter, comments — UX friction only.",
    size: "lg",
    Example: TextCaptchaExample,
    code: TEXT_EXAMPLE_CODE,
  },
  {
    id: "math",
    trust: "client",
    label: "Math",
    title: "Client · Math (BODMAS)",
    description:
      "Browser generates the expression and verifies the answer locally (BODMAS). Wrong answers auto-load the next problem.",
    sectionId: "example-math",
    component: "MathCaptcha",
    recommendedFor:
      "Contact forms, soft gates — still not a hard anti-bot wall.",
    size: "lg",
    Example: MathCaptchaExample,
    code: MATH_EXAMPLE_CODE,
  },
  {
    id: "slider",
    trust: "client",
    label: "Slider",
    title: "Client · Slider puzzle",
    description:
      "Browser-side drag-to-confirm. Release inside targetMin–targetMax to pass.",
    sectionId: "example-slider",
    component: "SliderCaptcha",
    recommendedFor: "Lightweight friction when math/text is too noisy.",
    size: "md",
    Example: SliderCaptchaExample,
    code: SLIDER_EXAMPLE_CODE,
  },
  {
    id: "secure",
    trust: "server",
    label: "Math",
    title: "Server · Math (trusted)",
    description:
      "POST /api/captcha/challenge issues the prompt; answer stays on the server. MathCaptcha serverChallenge + /api/captcha/verify.",
    sectionId: "example-secure",
    component: "MathCaptcha + /api/captcha",
    recommendedFor:
      "Login, checkout, signup, password reset — company standard.",
    size: "lg",
    Example: SecureMathCaptchaExample,
    code: SECURE_CLIENT_CODE,
  },
] as const;

export function getCaptchaExample(
  id: CaptchaExampleId,
): CaptchaExampleModule | undefined {
  return CAPTCHA_EXAMPLES.find((e) => e.id === id);
}

export function examplesForTrust(
  trust: CaptchaExampleModule["trust"],
): CaptchaExampleModule[] {
  return CAPTCHA_EXAMPLES.filter((e) => e.trust === trust);
}

export const CAPTCHA_EXAMPLE_OPTIONS = CAPTCHA_EXAMPLES.map((e) => ({
  id: e.id,
  label: e.label,
  trust: e.trust,
}));
