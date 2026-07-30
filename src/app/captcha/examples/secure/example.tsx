"use client";

import {
  MathCaptcha,
  type MathCaptchaHandle,
  type MathCaptchaServerChallenge,
} from "@itzsa/captcha";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ExampleShell,
  ExampleStatus,
  ExampleToolbar,
  GhostButton,
} from "../shared";

type ChallengeResponse = {
  ok: boolean;
  token: string;
  prompt: string;
  renderStamp: string;
  honeypotField: string;
  error?: string;
};

/**
 * Secure math captcha — challenge issued by POST /api/captcha/challenge.
 * Answer never leaves the server; UI uses MathCaptcha serverChallenge mode.
 */
export function SecureMathCaptchaExample() {
  const captchaRef = useRef<MathCaptchaHandle>(null);
  const metaRef = useRef<{
    renderStamp: string;
    honeypotField: string;
  } | null>(null);
  const [serverChallenge, setServerChallenge] =
    useState<MathCaptchaServerChallenge | null>(null);
  const [honeypotField, setHoneypotField] = useState("website");
  const [honeypotValue, setHoneypotValue] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    setVerified(false);
    setError(null);
    setHoneypotValue("");
    try {
      const res = await fetch("/api/captcha/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: "bodmas", action: "checkout" }),
      });
      const data = (await res.json()) as ChallengeResponse;
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Failed to load challenge");
        setServerChallenge(null);
        return;
      }
      metaRef.current = {
        renderStamp: data.renderStamp,
        honeypotField: data.honeypotField,
      };
      setHoneypotField(data.honeypotField);
      setServerChallenge({ prompt: data.prompt, token: data.token });
    } catch {
      setError("Network error loading challenge");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  return (
    <ExampleShell>
      <ExampleToolbar>
        <GhostButton onClick={() => void loadChallenge()}>
          New server challenge
        </GhostButton>
        <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1 font-mono text-[11px] text-secondary">
          data-mode=server
        </span>
      </ExampleToolbar>

      <p className="rounded-md border-[0.5px] border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-secondary">
        <span className="font-medium text-emerald-700 dark:text-emerald-300">
          Server mode
        </span>
        {" — "}
        prompt from{" "}
        <code className="text-primary">POST /api/captcha/challenge</code>.
        Answer never leaves the server. Checked with{" "}
        <code className="text-primary">verifyMathAnswer</code> in{" "}
        <code className="text-primary">POST /api/captcha/verify</code>. Company
        standard for login / checkout.
      </p>

      {/* Honeypot — hidden from users; bots often fill it */}
      <label className="sr-only" htmlFor={honeypotField}>
        Leave blank
      </label>
      <input
        id={honeypotField}
        name={honeypotField}
        type="text"
        value={honeypotValue}
        onChange={(e) => setHoneypotValue(e.target.value)}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <MathCaptcha
        ref={captchaRef}
        layout="inline"
        serverChallenge={serverChallenge}
        onRequestChallenge={() => void loadChallenge()}
        loading={loading}
        error={error}
        autoRefreshOnInvalid={false}
        maxAttempts={5}
        showCounter
        className="w-full max-w-2xl"
        verify={async ({ value, challengeId }) => {
          const meta = metaRef.current;
          if (!meta) return false;
          const res = await fetch("/api/captcha/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: challengeId,
              answer: value,
              renderStamp: meta.renderStamp,
              honeypotField: meta.honeypotField,
              honeypotValue,
              action: "checkout",
            }),
          });
          const data = (await res.json()) as {
            ok?: boolean;
            error?: string;
            retryAfterSec?: number;
          };
          if (!res.ok || !data.ok) {
            setError(
              data.error ??
                (data.retryAfterSec
                  ? `Locked — retry in ${data.retryAfterSec}s`
                  : "Verification failed"),
            );
            await loadChallenge();
            return false;
          }
          setError(null);
          return true;
        }}
        onVerified={(ok) => {
          setVerified(ok);
          if (ok) setError(null);
        }}
      />

      <ExampleStatus
        verified={verified}
        validateOk={verified ? (captchaRef.current?.validate() ?? true) : false}
      />
      <p className="text-[11px] text-tertiary">
        Challenge from{" "}
        <code className="text-secondary">POST /api/captcha/challenge</code>
        {" · "}
        verify via{" "}
        <code className="text-secondary">POST /api/captcha/verify</code>
        {" · "}
        answer never sent to the browser.
      </p>
    </ExampleShell>
  );
}
