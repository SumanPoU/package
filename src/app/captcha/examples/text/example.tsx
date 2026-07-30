"use client";

import {
  Captcha,
  type CaptchaCharsetMode,
  type CaptchaHandle,
} from "@itzsa/captcha";
import { useCallback, useRef, useState } from "react";

import {
  ExampleShell,
  ExampleStatus,
  ExampleToolbar,
  GhostButton,
  SegmentedControl,
} from "../shared";

const MODES: { id: CaptchaCharsetMode; label: string }[] = [
  { id: "both", label: "Both" },
  { id: "letters", label: "Letters" },
  { id: "numbers", label: "Numbers" },
];

/**
 * Live Text (canvas) captcha example — mirrors `TEXT_EXAMPLE_CODE`.
 * Host can simulate a bad verify API without leaving the docs.
 */
export function TextCaptchaExample() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [verified, setVerified] = useState(false);
  const [charsetMode, setCharsetMode] = useState<CaptchaCharsetMode>("both");
  const [length, setLength] = useState(6);
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
        <SegmentedControl
          ariaLabel="Charset mode"
          options={MODES}
          value={charsetMode}
          onChange={(id) => {
            setCharsetMode(id);
            setVerified(false);
            setApiError(null);
          }}
        />
        <label className="flex items-center gap-2 text-xs text-secondary">
          Length
          <input
            type="range"
            min={3}
            max={10}
            value={length}
            onChange={(e) => {
              setLength(Number(e.target.value));
              setVerified(false);
              setApiError(null);
            }}
            className="w-28"
          />
          <span className="tabular-nums text-primary">{length}</span>
        </label>
        <GhostButton
          onClick={() => {
            setSimulateBadApi(true);
            setApiError("API error: captcha rejected by server (429).");
            setVerified(false);
          }}
        >
          Simulate bad API
        </GhostButton>
        <GhostButton onClick={clearSession}>Clear simulation</GhostButton>
      </ExampleToolbar>

      <p className="rounded-md border-[0.5px] border-border bg-muted/40 px-2.5 py-1.5 text-[11px] leading-relaxed text-secondary">
        <span className="font-medium text-primary">Client mode</span>
        {" — "}
        canvas text is generated and matched in the browser (
        <code className="text-primary">generateCaptcha</code> /{" "}
        <code className="text-primary">verifyCaptcha</code>). Optional{" "}
        <code className="text-primary">verify()</code> can still hit your API
        after a local match.
      </p>

      <Captcha
        key={`${charsetMode}-${length}`}
        ref={captchaRef}
        length={length}
        charsetMode={charsetMode}
        excludeAmbiguous
        maxAttempts={5}
        showCounter
        error={apiError}
        className="w-full max-w-sm"
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
