/** Doc code samples — keep out of `"use client"` modules. */

export const TEXT_EXAMPLE_CODE = `import { useRef, useState } from "react";
import {
  Captcha,
  type CaptchaCharsetMode,
  type CaptchaHandle,
} from "@itzsa/captcha";

/**
 * Text (canvas) captcha — configurable length + charset.
 * Pattern: ref + onVerified + optional async verify.
 */
export function TextCaptchaExample() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [verified, setVerified] = useState(false);
  const [charsetMode, setCharsetMode] =
    useState<CaptchaCharsetMode>("both");
  const [length, setLength] = useState(6);
  const [apiError, setApiError] = useState<string | null>(null);

  async function onSubmit() {
    setApiError(null);
    if (!captchaRef.current?.validate()) return;

    try {
      // Your form / login API here
      await submitForm();
    } catch {
      setApiError("Server rejected the captcha.");
      captchaRef.current.refresh();
      setVerified(false);
    }
  }

  return (
    <div className="flex max-w-sm flex-col gap-3">
      {/* Optional host controls */}
      <select
        value={charsetMode}
        onChange={(e) => {
          setCharsetMode(e.target.value as CaptchaCharsetMode);
          setVerified(false);
        }}
      >
        <option value="both">Letters + digits</option>
        <option value="letters">Letters</option>
        <option value="numbers">Numbers</option>
      </select>

      <Captcha
        key={\`\${charsetMode}-\${length}\`}
        ref={captchaRef}
        length={length}
        charsetMode={charsetMode}
        excludeAmbiguous
        maxAttempts={5}
        showCounter
        error={apiError}
        verify={async ({ value, challengeId }) => {
          const res = await fetch("/api/captcha/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value, challengeId, kind: "text" }),
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

      <button type="button" disabled={!verified} onClick={onSubmit}>
        Continue
      </button>
    </div>
  );
}

async function submitForm() {
  /* … */
}`;

export const TEXT_MINIMAL_CODE = `import { useRef, useState } from "react";
import { Captcha, type CaptchaHandle } from "@itzsa/captcha";

export function LoginGate() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [verified, setVerified] = useState(false);

  return (
    <>
      <Captcha
        ref={captchaRef}
        length={6}
        charsetMode="both"
        onVerified={setVerified}
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
    </>
  );
}`;
