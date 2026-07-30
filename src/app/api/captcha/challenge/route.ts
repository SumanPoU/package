import type { MathDifficulty } from "@itzsa/captcha";
import { NextResponse } from "next/server";
import { issueChallenge } from "@/lib/captcha-security";
import { jsonError, withSessionCookie } from "@/lib/captcha-security/http";

export const runtime = "nodejs";

/**
 * POST /api/captcha/challenge
 * Issues a server-side math challenge. Answer is stored server-side only.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      difficulty?: MathDifficulty;
      action?: string;
    };

    const challenge = await issueChallenge({
      kind: "math",
      difficulty: body.difficulty ?? "medium",
      action: body.action ?? "generic",
    });

    const res = NextResponse.json({ ok: true, ...challenge });
    return withSessionCookie(res, req);
  } catch (err) {
    console.error("[captcha/challenge]", err);
    return jsonError(500, "Failed to issue challenge");
  }
}

/** Optional GET for quick manual checks. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const difficulty = (url.searchParams.get("difficulty") ??
    "medium") as MathDifficulty;
  const challenge = await issueChallenge({
    kind: "math",
    difficulty,
    action: url.searchParams.get("action") ?? "generic",
  });
  const res = NextResponse.json({ ok: true, ...challenge });
  return withSessionCookie(res, req);
}
