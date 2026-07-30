import type { KvStore } from "./store";
import { lockKey } from "./store";

export type RateLimitResult =
  | { allowed: true; failures: number; retryAfterSec?: undefined }
  | { allowed: false; failures: number; retryAfterSec: number; locked: true };

/**
 * Exponential backoff lockout after repeated failures (IP + session).
 * failures 1–2: allow; 3: 5s; 4: 15s; 5: 45s; 6+: 120s lock.
 */
export function backoffSeconds(failures: number): number {
  if (failures <= 2) return 0;
  if (failures === 3) return 5;
  if (failures === 4) return 15;
  if (failures === 5) return 45;
  return 120;
}

export async function checkLockout(
  store: KvStore,
  ip: string,
  sessionId: string,
): Promise<RateLimitResult> {
  const raw = await store.get(lockKey(ip, sessionId));
  if (!raw) return { allowed: true, failures: 0 };
  try {
    const data = JSON.parse(raw) as {
      until: number;
      failures: number;
    };
    const now = Date.now();
    if (data.until > now) {
      return {
        allowed: false,
        failures: data.failures,
        retryAfterSec: Math.ceil((data.until - now) / 1000),
        locked: true,
      };
    }
  } catch {
    /* ignore */
  }
  return { allowed: true, failures: 0 };
}

export async function recordFailure(
  store: KvStore,
  ip: string,
  sessionId: string,
  failures: number,
): Promise<RateLimitResult> {
  const wait = backoffSeconds(failures);
  if (wait <= 0) return { allowed: true, failures };
  const until = Date.now() + wait * 1000;
  await store.set(
    lockKey(ip, sessionId),
    JSON.stringify({ until, failures }),
    wait + 5,
  );
  return {
    allowed: false,
    failures,
    retryAfterSec: wait,
    locked: true,
  };
}
