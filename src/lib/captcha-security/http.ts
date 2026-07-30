import { NextResponse } from "next/server";

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function sessionIdFrom(req: Request): string {
  const cookie = req.headers.get("cookie") ?? "";
  const m = /(?:^|;\s*)itzsa_sid=([^;]+)/.exec(cookie);
  if (m?.[1]) return decodeURIComponent(m[1]);
  return "anon";
}

export function withSessionCookie(
  res: NextResponse,
  req: Request,
): NextResponse {
  if (sessionIdFrom(req) !== "anon") return res;
  const sid = crypto.randomUUID();
  res.cookies.set("itzsa_sid", sid, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

export function jsonError(
  status: number,
  error: string,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}
