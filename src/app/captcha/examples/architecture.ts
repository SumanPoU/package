/** Architecture + dual trust-model samples (server-safe strings). */

export const ARCHITECTURE = `┌─────────────────────────────────────────────────────────────┐
│  @itzsa/captcha                                              │
│  Shared headless engine                                      │
│    generateMathChallenge / verifyMathAnswer                  │
│    generateCaptcha / verifyCaptcha                           │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
     CLIENT trust model              SERVER trust model
     (default UI)                    (company standard)
                │                             │
  Captcha / MathCaptcha /          POST /api/captcha/challenge
  SliderCaptcha generate           → store answer (Redis/TTL)
  + verify in browser              → return { token, prompt }
                │                             │
  optional verify() callback       MathCaptcha serverChallenge
  after local match                + verify() → POST /verify
                                              │
                                   humanPass cookie / JWT
                                   gate /api/login, /checkout
`;

export const CLIENT_MATH_MINIMAL = `import { useRef, useState } from "react";
import { MathCaptcha, type MathCaptchaHandle } from "@itzsa/captcha";

/** Client: generate + verify in the browser */
export function ClientMathGate() {
  const ref = useRef<MathCaptchaHandle>(null);
  const [ok, setOk] = useState(false);

  return (
    <>
      <MathCaptcha
        ref={ref}
        difficulty="medium"
        layout="inline"
        // no serverChallenge → local generateMathChallenge + verifyMathAnswer
        onVerified={setOk}
      />
      <button type="button" disabled={!ok} onClick={() => {
        if (!ref.current?.validate()) return;
        // soft gate only
      }}>
        Continue
      </button>
    </>
  );
}`;

export const SERVER_MATH_MINIMAL = `import { useCallback, useEffect, useRef, useState } from "react";
import {
  MathCaptcha,
  type MathCaptchaHandle,
  type MathCaptchaServerChallenge,
} from "@itzsa/captcha";

/** Server: trusted source of truth — answer never sent to the client */
export function ServerMathGate() {
  const ref = useRef<MathCaptchaHandle>(null);
  const meta = useRef<{ renderStamp: string; honeypotField: string } | null>(null);
  const [challenge, setChallenge] = useState<MathCaptchaServerChallenge | null>(null);
  const [ok, setOk] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/captcha/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty: "bodmas", action: "login" }),
    });
    const data = await res.json();
    meta.current = { renderStamp: data.renderStamp, honeypotField: data.honeypotField };
    setChallenge({ prompt: data.prompt, token: data.token });
    setOk(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <MathCaptcha
      ref={ref}
      layout="inline"
      serverChallenge={challenge}
      onRequestChallenge={load}
      verify={async ({ value, challengeId }) => {
        const m = meta.current;
        if (!m) return false;
        const res = await fetch("/api/captcha/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: challengeId,
            answer: value,
            renderStamp: m.renderStamp,
            honeypotField: m.honeypotField,
            honeypotValue: "",
            action: "login",
          }),
        });
        return res.ok && (await res.json()).ok === true;
      }}
      onVerified={setOk}
    />
  );
}`;
