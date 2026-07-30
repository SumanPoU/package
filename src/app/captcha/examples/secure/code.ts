/** Doc / consumer sample — Express adapter (this monorepo runs Next.js). */

export const EXPRESS_SECURE_SERVER = `/**
 * Example Express wiring for @itzsa/captcha server-side challenges.
 * Uses the same headless helpers: generateMathChallenge + verifyMathAnswer.
 *
 * npm i express express-rate-limit rate-limit-redis redis ioredis cookie-parser
 * # optional: hcaptcha (or use Turnstile fetch below — no SDK)
 */
import express from "express";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { createClient } from "redis";
import {
  generateMathChallenge,
  verifyMathAnswer,
  createChallengeId,
} from "@itzsa/captcha";

const app = express();
app.use(express.json());
app.use(cookieParser());

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const challenges = new Map(); // replace with redis.set(token, JSON, { EX: 300 })

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.sendCommand(args),
  }),
});

app.post("/api/captcha/challenge", async (req, res) => {
  const token = createChallengeId();
  const c = generateMathChallenge({ difficulty: req.body?.difficulty ?? "medium" });
  // STORE answer server-side only — never send c.answer
  await redis.set(
    \`captcha:chal:\${token}\`,
    JSON.stringify({ answer: String(c.answer), kind: "math" }),
    { EX: 300 },
  );
  res.json({
    token,
    prompt: c.prompt,
    honeypotField: \`hp_\${token.slice(0, 8)}\`,
    renderStamp: Date.now(), // prefer HMAC-signed stamp in production
  });
});

app.post("/api/captcha/verify", verifyLimiter, async (req, res) => {
  const { token, answer, honeypotField, honeypotValue } = req.body ?? {};
  if (honeypotValue) return res.status(400).json({ ok: false });

  const raw = await redis.get(\`captcha:chal:\${token}\`);
  await redis.del(\`captcha:chal:\${token}\`); // single-use
  if (!raw) return res.status(400).json({ ok: false, error: "expired" });

  const { answer: expected } = JSON.parse(raw);
  const ok = verifyMathAnswer({ value: answer, answer: Number(expected) });
  if (!ok) return res.status(400).json({ ok: false, error: "incorrect" });

  // Issue short-lived human cookie / JWT here (HMAC or jose)
  res.cookie("itzsa_human", "…signed…", { httpOnly: true, sameSite: "lax" });
  res.json({ ok: true });
});

/** Sensitive action — require human cookie + optional Turnstile */
app.post("/api/checkout", async (req, res) => {
  // verifyTurnstile(req.body.turnstileToken)
  // verifyHumanPass(req.cookies.itzsa_human, "checkout")
  // idempotency key + velocity checks
  res.json({ ok: true });
});

app.listen(3001);
`;

export const SECURE_CLIENT_CODE = `import { useCallback, useEffect, useRef, useState } from "react";
import {
  MathCaptcha,
  type MathCaptchaHandle,
  type MathCaptchaServerChallenge,
} from "@itzsa/captcha";

type ChallengePayload = MathCaptchaServerChallenge & {
  renderStamp: string;
  honeypotField: string;
};

export function SecureCheckoutCaptcha() {
  const ref = useRef<MathCaptchaHandle>(null);
  const [serverChallenge, setServerChallenge] =
    useState<MathCaptchaServerChallenge | null>(null);
  const meta = useRef<{ renderStamp: string; honeypotField: string } | null>(
    null,
  );
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChallenge = useCallback(async () => {
    setVerified(false);
    setError(null);
    const res = await fetch("/api/captcha/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty: "bodmas", action: "checkout" }),
    });
    const data = (await res.json()) as ChallengePayload & { ok: boolean };
    if (!data.ok) throw new Error("challenge_failed");
    meta.current = {
      renderStamp: data.renderStamp,
      honeypotField: data.honeypotField,
    };
    setServerChallenge({ prompt: data.prompt, token: data.token });
  }, []);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!ref.current?.validate()) return;
        // humanPass cookie is set by /api/captcha/verify
        await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: 1000,
            currency: "NPR",
            idempotencyKey: crypto.randomUUID(),
          }),
        });
      }}
    >
      {/* Honeypot — leave empty; bots often fill it */}
      <input
        type="text"
        name={meta.current?.honeypotField ?? "website"}
        autoComplete="off"
        tabIndex={-1}
        aria-hidden
        style={{ position: "absolute", left: "-9999px" }}
        defaultValue=""
      />

      <MathCaptcha
        ref={ref}
        layout="inline"
        serverChallenge={serverChallenge}
        onRequestChallenge={loadChallenge}
        error={error}
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
              action: "checkout",
              // turnstileToken: turnstileResponse,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.ok) {
            setError(data.error ?? "Verification failed");
            await loadChallenge();
            return false;
          }
          return true;
        }}
        onVerified={setVerified}
      />

      <button type="submit" disabled={!verified}>
        Pay
      </button>
    </form>
  );
}`;
