"use client";

import { SliderCaptcha, type SliderCaptchaHandle } from "@itzsa/captcha";
import { useCallback, useRef, useState } from "react";

import {
  ExampleShell,
  ExampleStatus,
  ExampleToolbar,
  GhostButton,
} from "../shared";

/**
 * Live SliderCaptcha example — mirrors `SLIDER_EXAMPLE_CODE`.
 * Tune the success zone; failed releases snap back and count attempts.
 */
export function SliderCaptchaExample() {
  const captchaRef = useRef<SliderCaptchaHandle>(null);
  const [verified, setVerified] = useState(false);
  const [targetMin, setTargetMin] = useState(90);
  const [apiError, setApiError] = useState<string | null>(null);
  const [simulateBadApi, setSimulateBadApi] = useState(false);

  const clearSession = useCallback(() => {
    setApiError(null);
    setSimulateBadApi(false);
    setVerified(false);
    captchaRef.current?.refresh();
  }, []);

  return (
    <ExampleShell>
      <ExampleToolbar>
        <label className="flex items-center gap-2 text-xs text-secondary">
          Zone from
          <input
            type="range"
            min={70}
            max={95}
            value={targetMin}
            onChange={(e) => {
              setTargetMin(Number(e.target.value));
              setVerified(false);
              setApiError(null);
              captchaRef.current?.refresh();
            }}
            className="w-28"
          />
          <span className="tabular-nums text-primary">{targetMin}%</span>
        </label>
        <GhostButton
          onClick={() => {
            setSimulateBadApi(true);
            setApiError("API error: captcha rejected by server (429).");
            setVerified(false);
            captchaRef.current?.refresh();
          }}
        >
          Simulate bad API
        </GhostButton>
        <GhostButton
          onClick={() => {
            setApiError(null);
            captchaRef.current?.reset();
            setVerified(false);
          }}
        >
          Reset
        </GhostButton>
        <GhostButton onClick={clearSession}>Clear simulation</GhostButton>
      </ExampleToolbar>

      <p className="rounded-md border-[0.5px] border-border bg-muted/40 px-2.5 py-1.5 text-[11px] leading-relaxed text-secondary">
        <span className="font-medium text-primary">Client mode</span>
        {" — "}
        success zone is evaluated in the browser. Use server math for
        login/checkout.
      </p>

      <SliderCaptcha
        key={targetMin}
        ref={captchaRef}
        targetMin={targetMin}
        targetMax={100}
        maxAttempts={5}
        showCounter
        className="w-full max-w-sm"
        error={apiError}
        verify={
          simulateBadApi
            ? async () => {
                throw new Error("verify_failed");
              }
            : undefined
        }
        onError={(err) => {
          if (err.code !== "invalid") setApiError(err.message);
        }}
        onVerified={(ok) => {
          const next = simulateBadApi ? false : ok;
          setVerified(next);
          if (next) setApiError(null);
        }}
      />

      <ExampleStatus
        verified={verified}
        validateOk={
          verified && !simulateBadApi
            ? (captchaRef.current?.validate() ?? verified)
            : false
        }
      />
    </ExampleShell>
  );
}
