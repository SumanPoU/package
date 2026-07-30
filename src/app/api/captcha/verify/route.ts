import { NextResponse } from "next/server";

import { verifyChallenge } from "@/lib/captcha-security";
import {
  clientIp,
  jsonError,
  sessionIdFrom,
  withSessionCookie,
} from "@/lib/captcha-security/http";

export const runtime = "nodejs";

/**
 * POST /api/captcha/verify
 * Body: { token, answer, renderStamp, honeypotField, honeypotValue?, turnstileToken?, action }
 * On success: single-use token deleted + short-lived humanPass (also set as httpOnly cookie).
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const sessionId = sessionIdFrom(req);
  const ua = req.headers.get("user-agent") ?? undefined;

  const body = (await req.json().catch(() => null)) as {
    token?: string;
    answer?: string;
    renderStamp?: string;
    honeypotField?: string;
    honeypotValue?: string;
    turnstileToken?: string;
    action?: string;
  } | null;

  if (
    !body?.token ||
    body.answer == null ||
    !body.renderStamp ||
    !body.honeypotField
  ) {
    return jsonError(
      400,
      "Missing token, answer, renderStamp, or honeypotField",
    );
  }

  const result = await verifyChallenge({
    token: body.token,
    answer: String(body.answer),
    renderStamp: body.renderStamp,
    honeypotField: body.honeypotField,
    honeypotValue: body.honeypotValue,
    turnstileToken: body.turnstileToken,
    action: body.action ?? "generic",
    ip,
    userAgent: ua,
    sessionId,
  });

  if (!result.ok) {
    const res = NextResponse.json(
      {
        ok: false,
        error: result.error,
        retryAfterSec: result.retryAfterSec,
      },
      {
        status: result.status,
        headers: result.retryAfterSec
          ? { "Retry-After": String(result.retryAfterSec) }
          : undefined,
      },
    );
    return withSessionCookie(res, req);
  }

  const res = NextResponse.json({
    ok: true,
    humanPass: result.humanPass,
    expiresInSec: result.expiresInSec,
  });
  res.cookies.set("itzsa_human", result.humanPass, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: result.expiresInSec,
    secure: process.env.NODE_ENV === "production",
  });
  return withSessionCookie(res, req);
}
