/**
 * Cloudflare Turnstile server verification (no SDK required).
 * @see https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export async function verifyTurnstile(input: {
  token: string | undefined | null;
  remoteip?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    // Soft-skip when unset so local docs still work; enforce in production.
    if (process.env.NODE_ENV === "production") {
      return { ok: false, reason: "turnstile_not_configured" };
    }
    return { ok: true };
  }
  if (!input.token) return { ok: false, reason: "missing_turnstile_token" };

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", input.token);
  if (input.remoteip) body.set("remoteip", input.remoteip);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const data = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (!data.success) {
      return {
        ok: false,
        reason: (data["error-codes"] ?? ["turnstile_failed"]).join(","),
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "turnstile_network",
    };
  }
}
