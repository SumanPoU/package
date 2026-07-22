import { describe, expect, it, vi } from "vitest";

import { MemoryForexCache } from "../src";

describe("MemoryForexCache", () => {
  it("stores and retrieves values", () => {
    const cache = new MemoryForexCache();
    cache.set("a", { n: 1 });
    expect(cache.has("a")).toBe(true);
    expect(cache.get<{ n: number }>("a")).toEqual({ n: 1 });
  });

  it("expires after TTL", () => {
    vi.useFakeTimers();
    const cache = new MemoryForexCache();
    cache.set("x", 1, 1000);
    expect(cache.get("x")).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(cache.get("x")).toBeUndefined();
    expect(cache.has("x")).toBe(false);
    vi.useRealTimers();
  });

  it("treats null TTL as indefinite", () => {
    vi.useFakeTimers();
    const cache = new MemoryForexCache();
    cache.set("forever", true, null);
    vi.advanceTimersByTime(86_400_000 * 365);
    expect(cache.get("forever")).toBe(true);
    vi.useRealTimers();
  });

  it("clear removes all entries", () => {
    const cache = new MemoryForexCache();
    cache.set("a", 1);
    cache.set("b", 2);
    cache.clear();
    expect(cache.size).toBe(0);
  });
});
