import {
  generateMathChallenge,
  type MathDifficulty,
  verifyCaptcha,
  verifyMathAnswer,
} from "@itzsa/captcha";

import { securityLog } from "./logging";
import { checkLockout, recordFailure } from "./rate-limit";
import {
  type CaptchaKind,
  challengeKey,
  createStore,
  failKey,
  newToken,
  type StoredChallenge,
} from "./store";
import {
  assertHumanTiming,
  issueHumanPass,
  issueRenderStamp,
  readRenderStamp,
} from "./tokens";
import { verifyTurnstile } from "./turnstile";

const CHALLENGE_TTL_SEC = 5 * 60;
const FAIL_TTL_SEC = 15 * 60;
const HUMAN_PASS_TTL_SEC = 10 * 60;

export type PublicChallenge = {
  token: string;
  kind: CaptchaKind;
  /** Display only — never includes the answer. */
  prompt: string;
  /** Signed render timestamp for timing checks. */
  renderStamp: string;
  /** Honeypot field name (randomize per challenge). */
  honeypotField: string;
  expiresInSec: number;
};

export async function issueChallenge(input: {
  kind?: CaptchaKind;
  difficulty?: MathDifficulty;
  action?: string;
  charsetMode?: "both" | "letters" | "numbers";
  length?: number;
}): Promise<PublicChallenge> {
  const store = await createStore();
  const kind = input.kind ?? "math";
  const token = newToken();
  const honeypotField = `hp_${token.slice(0, 8)}`;

  if (kind !== "math") {
    // Secure canvas text needs a server-rendered image (not shipped yet).
    // Use math challenges as the trusted source of truth.
    throw new Error('Only kind "math" is supported for secure challenges');
  }

  const c = generateMathChallenge({
    difficulty: input.difficulty ?? "medium",
  });
  const answer = String(c.answer);
  const prompt = c.prompt;

  const record: StoredChallenge = {
    kind: "math",
    answer,
    renderedAt: Date.now(),
    action: input.action,
    fails: 0,
  };

  await store.set(
    challengeKey(token),
    JSON.stringify(record),
    CHALLENGE_TTL_SEC,
  );

  return {
    token,
    kind: "math",
    prompt,
    renderStamp: issueRenderStamp(record.renderedAt),
    honeypotField,
    expiresInSec: CHALLENGE_TTL_SEC,
  };
}

export type VerifyInput = {
  token: string;
  answer: string;
  /** Must match the honeypot field name from issueChallenge — must be empty. */
  honeypotField: string;
  honeypotValue?: string;
  renderStamp: string;
  turnstileToken?: string;
  action: string;
  ip: string;
  userAgent?: string;
  sessionId: string;
};

export type VerifyResult =
  | {
      ok: true;
      humanPass: string;
      expiresInSec: number;
    }
  | {
      ok: false;
      status: number;
      error: string;
      retryAfterSec?: number;
    };

export async function verifyChallenge(
  input: VerifyInput,
): Promise<VerifyResult> {
  const store = await createStore();
  const { ip, sessionId, userAgent: ua, action } = input;

  const lock = await checkLockout(store, ip, sessionId);
  if (!lock.allowed) {
    securityLog("lockout", {
      ip,
      ua,
      action,
      reason: "locked",
      retryAfterSec: lock.retryAfterSec,
    });
    return {
      ok: false,
      status: 429,
      error: "Too many attempts — try again later",
      retryAfterSec: lock.retryAfterSec,
    };
  }

  if (input.honeypotValue && String(input.honeypotValue).trim() !== "") {
    securityLog("honeypot", { ip, ua, action, field: input.honeypotField });
    await store.del(challengeKey(input.token));
    const fails = await store.incr(failKey(ip, sessionId), FAIL_TTL_SEC);
    await recordFailure(store, ip, sessionId, fails);
    return { ok: false, status: 400, error: "Verification failed" };
  }

  const stamp = readRenderStamp(input.renderStamp);
  if (!stamp.ok) {
    securityLog("timing_reject", { ip, ua, action, reason: stamp.reason });
    return { ok: false, status: 400, error: "Invalid render stamp" };
  }
  const timing = assertHumanTiming(stamp.renderedAt);
  if (!timing.ok) {
    securityLog("timing_reject", { ip, ua, action, reason: timing.reason });
    await store.del(challengeKey(input.token));
    const fails = await store.incr(failKey(ip, sessionId), FAIL_TTL_SEC);
    await recordFailure(store, ip, sessionId, fails);
    return { ok: false, status: 400, error: "Verification failed" };
  }

  const ts = await verifyTurnstile({
    token: input.turnstileToken,
    remoteip: ip,
  });
  if (!ts.ok) {
    securityLog("turnstile_fail", { ip, ua, action, reason: ts.reason });
    const fails = await store.incr(failKey(ip, sessionId), FAIL_TTL_SEC);
    await recordFailure(store, ip, sessionId, fails);
    return { ok: false, status: 400, error: "Bot check failed" };
  }

  const raw = await store.get(challengeKey(input.token));
  if (!raw) {
    securityLog("captcha_fail", { ip, ua, action, reason: "unknown_token" });
    const fails = await store.incr(failKey(ip, sessionId), FAIL_TTL_SEC);
    const limited = await recordFailure(store, ip, sessionId, fails);
    return {
      ok: false,
      status: 400,
      error: "Challenge expired or invalid",
      retryAfterSec: limited.retryAfterSec,
    };
  }

  const stored = JSON.parse(raw) as StoredChallenge;
  let match = false;
  if (stored.kind === "math") {
    match = verifyMathAnswer({
      value: input.answer,
      answer: Number(stored.answer),
    });
  } else {
    match = verifyCaptcha(input.answer, stored.answer, true);
  }

  // Single-use: always delete after attempt.
  await store.del(challengeKey(input.token));

  if (!match) {
    const fails = await store.incr(failKey(ip, sessionId), FAIL_TTL_SEC);
    const limited = await recordFailure(store, ip, sessionId, fails);
    securityLog("captcha_fail", {
      ip,
      ua,
      action,
      reason: "bad_answer",
      failures: fails,
    });
    return {
      ok: false,
      status: 400,
      error: "Incorrect answer",
      retryAfterSec: limited.retryAfterSec,
    };
  }

  securityLog("captcha_ok", { ip, ua, action });
  const humanPass = issueHumanPass(action, HUMAN_PASS_TTL_SEC);
  return {
    ok: true,
    humanPass,
    expiresInSec: HUMAN_PASS_TTL_SEC,
  };
}

export { securityLog } from "./logging";
export {
  createStore,
  idempotencyKey,
  velocityKey,
} from "./store";
export {
  issueHumanPass,
  verifyHumanPass,
} from "./tokens";
export { verifyTurnstile } from "./turnstile";
