/** Doc code samples — keep out of `"use client"` modules. */

export const SLIDER_EXAMPLE_CODE = `import { useRef, useState } from "react";
import {
  SliderCaptcha,
  type SliderCaptchaHandle,
} from "@itzsa/captcha";

/**
 * Slider captcha — release inside the success zone to pass.
 * Default zone: 90–100%. Failed releases snap back and count attempts.
 */
export function SliderCaptchaExample() {
  const captchaRef = useRef<SliderCaptchaHandle>(null);
  const [verified, setVerified] = useState(false);
  const [targetMin, setTargetMin] = useState(90);
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <div className="flex max-w-sm flex-col gap-3">
      <label>
        Success from {targetMin}%
        <input
          type="range"
          min={70}
          max={95}
          value={targetMin}
          onChange={(e) => {
            setTargetMin(Number(e.target.value));
            setVerified(false);
            captchaRef.current?.refresh();
          }}
        />
      </label>

      <SliderCaptcha
        ref={captchaRef}
        targetMin={targetMin}
        targetMax={100}
        maxAttempts={5}
        showCounter
        error={apiError}
        verify={async ({ value, challengeId, targetMin, targetMax }) => {
          const res = await fetch("/api/captcha/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              value,
              challengeId,
              kind: "slider",
              targetMin,
              targetMax,
            }),
          });
          if (!res.ok) throw new Error("verify_failed");
          return true;
        }}
        onError={(err) => {
          if (err.code !== "invalid") setApiError(err.message);
        }}
        onVerified={(ok) => {
          setVerified(ok);
          if (ok) setApiError(null);
        }}
      />

      <button
        type="button"
        disabled={!verified}
        onClick={() => {
          if (!captchaRef.current?.validate()) return;
          // submit…
        }}
      >
        Continue
      </button>
    </div>
  );
}`;
