/** Doc code samples — keep out of `"use client"` modules. */

export const MATH_EXAMPLE_CODE = `import { useRef, useState } from "react";
import {
  MathCaptcha,
  type MathCaptchaHandle,
  type MathCaptchaLayout,
  type MathDifficulty,
} from "@itzsa/captcha";

/**
 * CLIENT trust model
 * ------------------
 * generateMathChallenge + verifyMathAnswer run in the browser.
 * Optional verify() runs AFTER a local match (host/API check).
 * Use for UX friction only — bots can still solve simple math.
 */
export function MathCaptchaExample() {
  const captchaRef = useRef<MathCaptchaHandle>(null);
  const [difficulty, setDifficulty] = useState<MathDifficulty>("bodmas");
  const [layout, setLayout] = useState<MathCaptchaLayout>("inline");
  const [verified, setVerified] = useState(false);

  return (
    <MathCaptcha
      key={\`\${difficulty}-\${layout}\`}
      ref={captchaRef}
      difficulty={difficulty}
      layout={layout}              // "stack" | "inline"
      autoRefreshOnInvalid         // default true
      maxAttempts={5}
      showCounter
      // No serverChallenge → local generate + local verify
      onVerified={setVerified}
    />
  );
}`;

export const MATH_HEADLESS_CODE = `import {
  generateMathChallenge,
  verifyMathAnswer,
  evaluateExpression,
} from "@itzsa/captcha";

// Same helpers power BOTH client UI and your server challenge API
const challenge = generateMathChallenge({ difficulty: "bodmas" });
// challenge.prompt, challenge.expression, challenge.answer, challenge.requiresBodmas

const ok = verifyMathAnswer({
  value: userInput,
  answer: challenge.answer,
});

evaluateExpression("(2+3)*4"); // → 20  (BODMAS)
evaluateExpression("2+3*4");   // → 14`;
