import { NextResponse } from "next/server";

import {
  createStore,
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
const VELOCITY_MAX = 10;

/**
 * POST /api/login — example sensitive action gated by humanPass.
 * Requires prior successful POST /api/captcha/verify with action: "login".
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") ?? undefined;
  const sessionId = sessionIdFrom(req);

  const body = (await req.json().catch(() => null)) as {
    email?: string;
    password?: string;
    humanPass?: string;
  } | null;

  const cookiePass = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)itzsa_human=([^;]+)/)?.[1];
  const humanPass =
    body?.humanPass ??
    (cookiePass ? decodeURIComponent(cookiePass) : undefined);

  const gate = verifyHumanPass(humanPass, "login");
  if (!gate.ok) {
    securityLog("human_pass_reject", {
      ip,
      ua,
      action: "login",
      reason: gate.reason,
    });
    return jsonError(403, "Captcha verification required");
  }

  const store = await createStore();
  const vel = await store.incr(
    velocityKey("login", `${ip}:${sessionId}`),
    VELOCITY_WINDOW_SEC,
  );
  if (vel > VELOCITY_MAX) {
    securityLog("velocity_reject", {
      ip,
      ua,
      action: "login",
      count: vel,
    });
    return jsonError(429, "Too many login attempts");
  }

  if (!body?.email || !body?.password) {
    return jsonError(400, "email and password required");
  }

  // Demo only — replace with real auth.
  return NextResponse.json({
    ok: true,
    message: "Login accepted (demo)",
    email: body.email,
  });
}
