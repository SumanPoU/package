import type { ForexCache } from "./types";

type Entry = {
  value: unknown;
  /** Epoch ms; null = never expires. */
  expiresAt: number | null;
};

/**
 * Default in-memory cache.
 * Suitable for single-process apps; swap for Redis via `ForexCache` on servers.
 */
export class MemoryForexCache implements ForexCache {
  private readonly store = new Map<string, Entry>();

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expiresAt != null && Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number | null): void {
    const expiresAt =
      ttlMs == null || ttlMs === Number.POSITIVE_INFINITY
        ? null
        : Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Test/helper: number of live entries. */
  get size(): number {
    // purge expired lazily
    for (const key of [...this.store.keys()]) {
      void this.get(key);
    }
    return this.store.size;
  }
}

export function createMemoryCache(): MemoryForexCache {
  return new MemoryForexCache();
}
