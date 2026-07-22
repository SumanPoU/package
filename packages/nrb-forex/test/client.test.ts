import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createNrbForexClient,
  MemoryForexCache,
  NrbApiError,
  NrbRateNotFoundError,
  NrbValidationError,
  perUnitRates,
  setDefaultClient,
} from "../src";
import {
  FIXTURE_DAY_2026_07_17,
  FIXTURE_EMPTY,
  jsonResponse,
  pageResponse,
} from "./fixtures";

afterEach(() => {
  setDefaultClient(null);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("NrbForexClient", () => {
  it("parses rates and preserves unit !== 1 (INR/JPY/KRW)", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(FIXTURE_DAY_2026_07_17));
    const client = createNrbForexClient({
      fetch: fetchMock,
      cache: new MemoryForexCache(),
    });

    const usd = await client.getRate("USD", "2026-07-17");
    expect(usd.buy).toBe(153.86);
    expect(usd.unit).toBe(1);

    const inr = await client.getRate("inr", "2026-07-17");
    expect(inr.unit).toBe(100);
    expect(inr.buy).toBe(160);
    expect(perUnitRates(inr).buy).toBeCloseTo(1.6, 10);

    const jpy = await client.getRate("JPY", "2026-07-17");
    expect(jpy.unit).toBe(10);
    expect(perUnitRates(jpy).buy).toBeCloseTo(0.949, 10);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls as unknown as Array<
      [RequestInfo | URL, RequestInit?]
    >;
    const url = String(firstCall[0]![0]);
    expect(url).toContain("from=2026-07-17");
    expect(url).toContain("to=2026-07-17");
    expect(url).toContain("page=1");
    expect(url).toContain("per_page=100");
  });

  it("throws NrbRateNotFoundError on empty day without fallback", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(FIXTURE_EMPTY));
    const client = createNrbForexClient({ fetch: fetchMock });

    await expect(client.getRate("USD", "2026-07-19")).rejects.toBeInstanceOf(
      NrbRateNotFoundError,
    );
  });

  it("falls back to previous published day when opted in", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("from=2026-07-19")) {
        return jsonResponse(FIXTURE_EMPTY);
      }
      if (url.includes("from=2026-07-18")) {
        return jsonResponse(FIXTURE_EMPTY);
      }
      if (url.includes("from=2026-07-17")) {
        return jsonResponse(FIXTURE_DAY_2026_07_17);
      }
      return jsonResponse(FIXTURE_EMPTY);
    });

    const client = createNrbForexClient({ fetch: fetchMock });
    const rate = await client.getRate("USD", "2026-07-19", {
      fallbackToPreviousDay: true,
      fallbackMaxLookbackDays: 5,
    });

    expect(rate.date).toBe("2026-07-17");
    expect(rate.isFallback).toBe(true);
    expect(rate.buy).toBe(153.86);
  });

  it("paginates automatically across pages", async () => {
    const dayA = {
      date: "2026-07-01",
      published_on: "2026-07-01 00:00:00",
      modified_on: "2026-07-01 00:00:00",
      rates: [
        {
          currency: { iso3: "USD", name: "U.S. Dollar", unit: 1 },
          buy: "150.00",
          sell: "150.50",
        },
      ],
    };
    const dayB = {
      date: "2026-07-02",
      published_on: "2026-07-02 00:00:00",
      modified_on: "2026-07-02 00:00:00",
      rates: [
        {
          currency: { iso3: "USD", name: "U.S. Dollar", unit: 1 },
          buy: "151.00",
          sell: "151.50",
        },
      ],
    };

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      const page = Number(url.searchParams.get("page"));
      if (page === 1) return jsonResponse(pageResponse([dayA], 1, 2));
      if (page === 2) return jsonResponse(pageResponse([dayB], 2, 2));
      throw new Error(`unexpected page ${page}`);
    });

    const client = createNrbForexClient({ fetch: fetchMock });
    const history = await client.getRateHistory(
      "USD",
      "2026-07-01",
      "2026-07-02",
    );
    expect(history).toHaveLength(2);
    expect(history[0]!.buy).toBe(150);
    expect(history[1]!.buy).toBe(151);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects malformed buy/sell strings", async () => {
    const bad = structuredClone(FIXTURE_DAY_2026_07_17);
    bad.data!.payload![0]!.rates[1]!.buy = "not-a-number";

    const client = createNrbForexClient({
      fetch: vi.fn(async () => jsonResponse(bad)),
    });

    await expect(client.getRatesForDate("2026-07-17")).rejects.toBeInstanceOf(
      NrbApiError,
    );
  });

  it("retries network failures then fails", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("network down");
    });
    const client = createNrbForexClient({
      fetch: fetchMock,
      maxRetries: 3,
      retryBaseMs: 1,
    });

    await expect(client.getRate("USD", "2026-07-17")).rejects.toBeInstanceOf(
      NrbApiError,
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("coalesces concurrent same-date requests into one HTTP call", async () => {
    let resolveFetch!: (value: Response) => void;
    const gate = new Promise<Response>((r) => {
      resolveFetch = r;
    });
    const fetchMock = vi.fn(async () => gate);

    const client = createNrbForexClient({
      fetch: fetchMock,
      cache: new MemoryForexCache(),
    });

    const p1 = client.getRate("USD", "2026-07-17");
    const p2 = client.getRate("INR", "2026-07-17");

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    resolveFetch(jsonResponse(FIXTURE_DAY_2026_07_17));
    const [usd, inr] = await Promise.all([p1, p2]);
    expect(usd.currency).toBe("USD");
    expect(inr.currency).toBe("INR");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("validates bad currency / date inputs", async () => {
    const client = createNrbForexClient({
      fetch: vi.fn(async () => jsonResponse(FIXTURE_EMPTY)),
    });
    await expect(client.getRate("US")).rejects.toBeInstanceOf(
      NrbValidationError,
    );
    await expect(client.getRate("USD", "07-17-2026")).rejects.toBeInstanceOf(
      NrbValidationError,
    );
  });

  it("convert applies unit for INR", async () => {
    const client = createNrbForexClient({
      fetch: vi.fn(async () => jsonResponse(FIXTURE_DAY_2026_07_17)),
    });
    // 100 INR → buy 160 NPR for unit 100 → 100 * (160/100) = 160
    const npr = await client.convert(100, "INR", "NPR", {
      date: "2026-07-17",
      side: "buy",
    });
    expect(npr).toBeCloseTo(160, 10);

    // 10 JPY → 10 * (9.49/10) = 9.49
    const jpyNpr = await client.convert(10, "JPY", "NPR", {
      date: "2026-07-17",
      side: "buy",
    });
    expect(jpyNpr).toBeCloseTo(9.49, 10);
  });

  it("caches historical ranges and does not re-fetch", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(FIXTURE_DAY_2026_07_17));
    const cache = new MemoryForexCache();
    const client = createNrbForexClient({ fetch: fetchMock, cache });

    await client.getRatesForDate("2026-07-17");
    await client.getRatesForDate("2026-07-17");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
