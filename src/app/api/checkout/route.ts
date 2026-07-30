import { NextResponse } from "next/server";

import {
  createStore,
  idempotencyKey,
  securityLog,
  velocityKey,
  verifyHumanPass,
} from "@/lib/captcha-security";
import {
  clientIp,
  jsonError,
  sessionIdFrom,
} from "@/lib/captcha-security/http";

export const runtime = "nodejs";

const VELOCITY_WINDOW_SEC = 60;
const VELOCITY_MAX = 5;
const IDEM_TTL_SEC = 24 * 60 * 60;

/**
 * POST /api/checkout — gated by humanPass (action: "checkout") + idempotency key.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") ?? undefined;
  const sessionId = sessionIdFrom(req);

  const body = (await req.json().catch(() => null)) as {
    amount?: number;
    currency?: string;
    humanPass?: string;
    idempotencyKey?: string;
  } | null;

  const cookiePass = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)itzsa_human=([^;]+)/)?.[1];
  const humanPass =
    body?.humanPass ??
    (cookiePass ? decodeURIComponent(cookiePass) : undefined);

  const gate = verifyHumanPass(humanPass, "checkout");
  if (!gate.ok) {
    securityLog("human_pass_reject", {
      ip,
      ua,
      action: "checkout",
      reason: gate.reason,
    });
    return jsonError(403, "Captcha verification required");
  }

  const idem = body?.idempotencyKey?.trim();
  if (!idem) {
    return jsonError(400, "idempotencyKey required");
  }

  const store = await createStore();
  const existing = await store.get(idempotencyKey("checkout", idem));
  if (existing) {
    securityLog("idempotency_replay", { ip, ua, action: "checkout", idem });
    return NextResponse.json(JSON.parse(existing));
  }

  const vel = await store.incr(
    velocityKey("checkout", `${ip}:${sessionId}`),
    VELOCITY_WINDOW_SEC,
  );
  if (vel > VELOCITY_MAX) {
    securityLog("velocity_reject", {
      ip,
      ua,
      action: "checkout",
      count: vel,
    });
    return jsonError(429, "Too many checkout attempts");
  }

  if (typeof body?.amount !== "number" || body.amount <= 0) {
    return jsonError(400, "valid amount required");
  }

  const payload = {
    ok: true,
    message: "Checkout accepted (demo)",
    amount: body.amount,
    currency: body.currency ?? "NPR",
    orderId: `ord_${idem.slice(0, 12)}`,
  };

  await store.set(
    idempotencyKey("checkout", idem),
    JSON.stringify(payload),
    IDEM_TTL_SEC,
  );

  return NextResponse.json(payload);
}
