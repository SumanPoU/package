/**
 * @fileoverview Storage sanitization — single choke point for IngestLog JSON.
 *
 * All writes to `IngestLog.rawResponse` must pass through `sanitizeForStorage`.
 */

import type { Prisma } from "@prisma/client";

const SENSITIVE_KEY =
  /^(authorization|cookie|set-cookie|x-api-key|api[_-]?key|token|secret|password|passwd|auth|ip|client[_-]?ip|x-forwarded-for|user-agent|ua|cf-connecting-ip|headers|request|response)$/i;

const REDACTED = "[REDACTED]";

/**
 * Mask request metadata before persisting.
 * Keeps rate data arrays; strips headers, cookies, tokens, IPs, UA.
 */
export const sanitizeForStorage = (input: unknown): Prisma.InputJsonValue => {
  const redact = (value: unknown, key?: string): unknown => {
    if (key && SENSITIVE_KEY.test(key)) return REDACTED;
    if (value === null || value === undefined) return null;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => redact(item));
    }
    if (typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = redact(v, k);
      }
      return out;
    }
    return REDACTED;
  };

  return redact(input) as Prisma.InputJsonValue;
};
