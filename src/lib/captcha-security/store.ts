import { createChallengeId } from "@itzsa/captcha";

export type CaptchaKind = "math" | "text";

export type StoredChallenge = {
  kind: CaptchaKind;
  /** Expected answer — never sent to the client. */
  answer: string;
  /** ISO render time for timing checks. */
  renderedAt: number;
  /** Optional action this challenge is bound to. */
  action?: string;
  fails: number;
};

export type KvStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string, ttlSeconds: number): Promise<number>;
};

type MemoryEntry = { value: string; expiresAt: number };

const g = globalThis as typeof globalThis & {
  __itzsaCaptchaStore?: Map<string, MemoryEntry>;
};

function memoryMap(): Map<string, MemoryEntry> {
  if (!g.__itzsaCaptchaStore) g.__itzsaCaptchaStore = new Map();
  return g.__itzsaCaptchaStore;
}

function purgeExpired(map: Map<string, MemoryEntry>) {
  const now = Date.now();
  for (const [k, v] of map) {
    if (v.expiresAt <= now) map.delete(k);
  }
}

/** Process-local TTL store (docs / single-instance). Swap for Redis in production. */
export function createMemoryStore(): KvStore {
  return {
    async get(key) {
      const map = memoryMap();
      purgeExpired(map);
      const hit = map.get(key);
      if (!hit) return null;
      if (hit.expiresAt <= Date.now()) {
        map.delete(key);
        return null;
      }
      return hit.value;
    },
    async set(key, value, ttlSeconds) {
      const map = memoryMap();
      map.set(key, {
        value,
        expiresAt: Date.now() + Math.max(1, ttlSeconds) * 1000,
      });
    },
    async del(key) {
      memoryMap().delete(key);
    },
    async incr(key, ttlSeconds) {
      const map = memoryMap();
      purgeExpired(map);
      const cur = map.get(key);
      const n = cur && cur.expiresAt > Date.now() ? Number(cur.value) || 0 : 0;
      const next = n + 1;
      map.set(key, {
        value: String(next),
        expiresAt: Date.now() + Math.max(1, ttlSeconds) * 1000,
      });
      return next;
    },
  };
}

/**
 * Optional Redis adapter when `REDIS_URL` is set.
 * Uses Function constructor-style dynamic import so TypeScript does not require
 * the `redis` package at build time (memory store is the default).
 */
export async function createStore(): Promise<KvStore> {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return createMemoryStore();

  try {
    const importRedis = new Function(
      "return import('redis')",
    ) as () => Promise<{
      createClient: (opts: { url: string }) => {
        isOpen: boolean;
        connect: () => Promise<unknown>;
        on: (event: string, cb: (err: Error) => void) => void;
        get: (key: string) => Promise<string | null>;
        set: (
          key: string,
          value: string,
          opts: { EX: number },
        ) => Promise<unknown>;
        del: (key: string) => Promise<unknown>;
        incr: (key: string) => Promise<number>;
        expire: (key: string, sec: number) => Promise<unknown>;
      };
    }>;
    const mod = await importRedis();
    const client = mod.createClient({ url });
    client.on("error", (err: Error) => {
      console.error("[captcha-security] redis error", err.message);
    });
    if (!client.isOpen) await client.connect();

    return {
      async get(key) {
        return client.get(key);
      },
      async set(key, value, ttlSeconds) {
        await client.set(key, value, { EX: Math.max(1, ttlSeconds) });
      },
      async del(key) {
        await client.del(key);
      },
      async incr(key, ttlSeconds) {
        const n = await client.incr(key);
        if (n === 1) await client.expire(key, Math.max(1, ttlSeconds));
        return n;
      },
    };
  } catch (err) {
    console.warn(
      "[captcha-security] Redis unavailable — falling back to memory store",
      err instanceof Error ? err.message : err,
    );
    return createMemoryStore();
  }
}

export function challengeKey(token: string): string {
  return `captcha:chal:${token}`;
}

export function failKey(ip: string, sessionId: string): string {
  return `captcha:fail:${ip}:${sessionId}`;
}

export function lockKey(ip: string, sessionId: string): string {
  return `captcha:lock:${ip}:${sessionId}`;
}

export function idempotencyKey(scope: string, key: string): string {
  return `captcha:idem:${scope}:${key}`;
}

export function velocityKey(scope: string, id: string): string {
  return `captcha:vel:${scope}:${id}`;
}

export function newToken(): string {
  return createChallengeId();
}
