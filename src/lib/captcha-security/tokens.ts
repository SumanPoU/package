import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function secret(): string {
  const s = process.env.CAPTCHA_HMAC_SECRET?.trim();
  if (s && s.length >= 16) return s;
  // Docs / local fallback — set CAPTCHA_HMAC_SECRET in production.
  return "itzsa-captcha-dev-secret-change-me";
}

function b64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf, "utf8") : buf;
  return b
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function sign(payloadB64: string): string {
  return b64url(createHmac("sha256", secret()).update(payloadB64).digest());
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export type HumanPassClaims = {
  /** Bound action: login | checkout | signup | … */
  act: string;
  /** Issued-at unix seconds */
  iat: number;
  /** Expiry unix seconds */
  exp: number;
  /** Random nonce */
  jti: string;
};

/** Short-lived signed token proving a successful captcha verify. */
export function issueHumanPass(action: string, ttlSeconds = 10 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const claims: HumanPassClaims = {
    act: action,
    iat: now,
    exp: now + ttlSeconds,
    jti: b64url(randomBytes(12)),
  };
  const payload = b64url(JSON.stringify(claims));
  return `${payload}.${sign(payload)}`;
}

export function verifyHumanPass(
  token: string | undefined | null,
  expectedAction: string,
): { ok: true; claims: HumanPassClaims } | { ok: false; reason: string } {
  if (!token || !token.includes(".")) {
    return { ok: false, reason: "missing_token" };
  }
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sign(payload), sig)) {
    return { ok: false, reason: "bad_signature" };
  }
  try {
    const claims = JSON.parse(
      fromB64url(payload).toString("utf8"),
    ) as HumanPassClaims;
    if (claims.act !== expectedAction) {
      return { ok: false, reason: "wrong_action" };
    }
    if (claims.exp < Math.floor(Date.now() / 1000)) {
      return { ok: false, reason: "expired" };
    }
    return { ok: true, claims };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}

/** Signed render timestamp for anti-bot timing checks. */
export function issueRenderStamp(nowMs = Date.now()): string {
  const payload = b64url(JSON.stringify({ t: nowMs }));
  return `${payload}.${sign(payload)}`;
}

export function readRenderStamp(
  stamp: string | undefined | null,
): { ok: true; renderedAt: number } | { ok: false; reason: string } {
  if (!stamp || !stamp.includes(".")) {
    return { ok: false, reason: "missing_stamp" };
  }
  const [payload, sig] = stamp.split(".");
  if (!payload || !sig || !safeEqual(sign(payload), sig)) {
    return { ok: false, reason: "bad_signature" };
  }
  try {
    const data = JSON.parse(fromB64url(payload).toString("utf8")) as {
      t: number;
    };
    if (!Number.isFinite(data.t)) return { ok: false, reason: "malformed" };
    return { ok: true, renderedAt: data.t };
  } catch {
    return { ok: false, reason: "malformed" };
  }
}

/**
 * Reject submissions that are too fast (bot) or too old (replay).
 * @default minMs 1200, maxMs 5 minutes
 */
export function assertHumanTiming(
  renderedAt: number,
  opts?: { minMs?: number; maxMs?: number; now?: number },
): { ok: true } | { ok: false; reason: "too_fast" | "too_slow" } {
  const now = opts?.now ?? Date.now();
  const minMs =
    opts?.minMs ?? (Number(process.env.CAPTCHA_MIN_SOLVE_MS) || 800);
  const maxMs =
    opts?.maxMs ?? (Number(process.env.CAPTCHA_MAX_SOLVE_MS) || 5 * 60_000);
  const elapsed = now - renderedAt;
  if (elapsed < minMs) return { ok: false, reason: "too_fast" };
  if (elapsed > maxMs) return { ok: false, reason: "too_slow" };
  return { ok: true };
}
