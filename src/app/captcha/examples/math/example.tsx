"use client";

import {
  MathCaptcha,
  type MathCaptchaHandle,
  type MathCaptchaLayout,
  type MathDifficulty,
} from "@itzsa/captcha";
import { useCallback, useRef, useState } from "react";

import {
  ExampleShell,
  ExampleStatus,
  ExampleToolbar,
  GhostButton,
  SegmentedControl,
} from "../shared";

const DIFFS: { id: MathDifficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
  { id: "bodmas", label: "BODMAS" },
];

const LAYOUTS: { id: MathCaptchaLayout; label: string }[] = [
  { id: "stack", label: "Stack" },
  { id: "inline", label: "Inline" },
];

/**
 * Client trust model — generateMathChallenge + verifyMathAnswer run in the browser.
 * Optional verify() can still call a host API after a local match.
 */
export function MathCaptchaExample() {
  const captchaRef = useRef<MathCaptchaHandle>(null);
  const [difficulty, setDifficulty] = useState<MathDifficulty>("easy");
  const [layout, setLayout] = useState<MathCaptchaLayout>("inline");
  const [verified, setVerified] = useState(false);
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
          ariaLabel="Math difficulty"
          options={DIFFS}
          value={difficulty}
          onChange={(id) => {
            setDifficulty(id);
            setVerified(false);
            setApiError(null);
          }}
        />
        <SegmentedControl
          ariaLabel="Layout"
          options={LAYOUTS}
          value={layout}
          onChange={setLayout}
        />
        <GhostButton
          onClick={() => {
            setSimulateBadApi(true);
            setApiError("API error: captcha rejected by server (429).");
            setVerified(false);
          }}
        >
          Simulate bad API
        </GhostButton>
        <GhostButton
          onClick={() => {
            setApiError(null);
            captchaRef.current?.refresh();
            setVerified(false);
          }}
        >
          New problem
        </GhostButton>
        <GhostButton onClick={clearSession}>Clear simulation</GhostButton>
      </ExampleToolbar>

      <p className="rounded-md border-[0.5px] border-border bg-muted/40 px-2.5 py-1.5 text-[11px] leading-relaxed text-secondary">
        <span className="font-medium text-primary">Client mode</span>
        {" — "}
        challenge is generated with{" "}
        <code className="text-primary">generateMathChallenge</code> in the
        browser; answer is checked locally with{" "}
        <code className="text-primary">verifyMathAnswer</code>
        {simulateBadApi
          ? ", then optional verify() can still fail (simulated)."
          : "."}{" "}
        Not a hard security boundary.
      </p>

      <MathCaptcha
        key={`${difficulty}-${layout}`}
        ref={captchaRef}
        difficulty={difficulty}
        layout={layout}
        autoRefreshOnInvalid
        maxAttempts={5}
        showCounter
        className="w-full max-w-2xl"
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
