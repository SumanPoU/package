export type SecurityLogEvent =
  | "captcha_fail"
  | "captcha_ok"
  | "honeypot"
  | "timing_reject"
  | "lockout"
  | "turnstile_fail"
  | "human_pass_reject"
  | "velocity_reject"
  | "idempotency_replay";

export function securityLog(
  event: SecurityLogEvent,
  meta: {
    ip?: string;
    ua?: string;
    action?: string;
    reason?: string;
    [key: string]: unknown;
  },
): void {
  const line = {
    ts: new Date().toISOString(),
    event,
    ...meta,
  };
  // Structured stdout — ship to your log drain / APM in production.
  console.info("[captcha-security]", JSON.stringify(line));
}
