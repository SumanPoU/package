import { MemoryForexCache } from "./cache";
import { convertAmount } from "./convert";
import {
  assertRange,
  cacheTtlMsForDate,
  normalizeCurrencyCode,
  shiftIsoDate,
  toIsoDate,
} from "./dates";
import {
  NrbApiError,
  NrbRateNotFoundError,
  NrbValidationError,
} from "./errors";
import { parsePayloadDay } from "./parse";
import type {
  ConvertOptions,
  CurrencyInfo,
  DailyForexSnapshot,
  ForexCache,
  ForexRate,
  NrbForexClientOptions,
  NrbRatesResponse,
  RateQueryOptions,
} from "./types";

export const NRB_FOREX_BASE_URL = "https://www.nrb.org.np/api/forex/v1";

const DEFAULT_PER_PAGE = 100;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_BASE_MS = 200;
const DEFAULT_LOOKBACK = 14;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveMaybePromise<T>(value: T | Promise<T>): Promise<T> {
  return value;
}

/**
 * Typed NRB forex client: pagination, cache, coalescing, retries.
 */
export class NrbForexClient {
  private readonly baseUrl: string;
  private readonly cache: ForexCache;
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly maxRetries: number;
  private readonly retryBaseMs: number;
  private readonly defaultFallback: boolean;
  private readonly defaultLookback: number;

  /** In-flight range fetches — coalesce concurrent callers. */
  private readonly inflight = new Map<string, Promise<DailyForexSnapshot[]>>();

  constructor(options: NrbForexClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? NRB_FOREX_BASE_URL).replace(/\/$/, "");
    this.cache = options.cache ?? new MemoryForexCache();
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.maxRetries = options.maxRetries ?? DEFAULT_RETRIES;
    this.retryBaseMs = options.retryBaseMs ?? DEFAULT_RETRY_BASE_MS;
    this.defaultFallback = options.fallbackToPreviousDay ?? false;
    this.defaultLookback = options.fallbackMaxLookbackDays ?? DEFAULT_LOOKBACK;
  }

  /** Single date, single currency. */
  async getRate(
    currency: string,
    date?: Date | string,
    options?: RateQueryOptions,
  ): Promise<ForexRate> {
    const iso3 = normalizeCurrencyCode(currency);
    const day = toIsoDate(date);
    const snapshot = await this.resolveSnapshotForDay(day, options);
    const hit = snapshot.rates.find((r) => r.currency === iso3);
    if (!hit) {
      throw new NrbRateNotFoundError(snapshot.date, iso3);
    }
    return {
      ...hit,
      isFallback: snapshot.date !== day ? true : hit.isFallback,
      date: snapshot.date,
    };
  }

  /** Single date, all currencies. */
  async getRatesForDate(
    date?: Date | string,
    options?: RateQueryOptions,
  ): Promise<ForexRate[]> {
    const day = toIsoDate(date);
    const snapshot = await this.resolveSnapshotForDay(day, options);
    return snapshot.rates.map((r) => ({
      ...r,
      isFallback: snapshot.date !== day ? true : r.isFallback,
      date: snapshot.date,
    }));
  }

  /** Range, one currency — for charts. */
  async getRateHistory(
    currency: string,
    from: Date | string,
    to: Date | string,
  ): Promise<ForexRate[]> {
    const iso3 = normalizeCurrencyCode(currency);
    const fromIso = toIsoDate(from);
    const toIso = toIsoDate(to);
    assertRange(fromIso, toIso);
    const snapshots = await this.getRatesInRange(fromIso, toIso);
    const out: ForexRate[] = [];
    for (const snap of snapshots) {
      const hit = snap.rates.find((r) => r.currency === iso3);
      if (hit) out.push(hit);
    }
    return out;
  }

  /** Range, all currencies — paginated internally. */
  async getRatesInRange(
    from: Date | string,
    to: Date | string,
  ): Promise<DailyForexSnapshot[]> {
    const fromIso = toIsoDate(from);
    const toIso = toIsoDate(to);
    assertRange(fromIso, toIso);
    return this.fetchRangeCached(fromIso, toIso);
  }

  /**
   * Convert foreign amount → NPR using NRB rates.
   * `to` is currently fixed to NPR (NRB quotes vs NPR only).
   */
  async convert(
    amount: number,
    from: string,
    to: "NPR",
    options?: ConvertOptions,
  ): Promise<number> {
    if (to !== "NPR") {
      throw new NrbValidationError(
        'Only conversion to "NPR" is supported (NRB quotes foreign → NPR)',
      );
    }
    const rate = await this.getRate(from, options?.date, options);
    return convertAmount(amount, rate, options?.side ?? "mid");
  }

  async getSupportedCurrencies(
    date?: Date | string,
    options?: RateQueryOptions,
  ): Promise<CurrencyInfo[]> {
    const rates = await this.getRatesForDate(date, options);
    return rates.map((r) => ({
      iso3: r.currency,
      name: r.currencyName,
      unit: r.unit,
    }));
  }

  /** Clear the configured cache (if it supports `clear`). */
  async clearCache(): Promise<void> {
    if (this.cache.clear) await resolveMaybePromise(this.cache.clear());
  }

  private mergeQueryOptions(
    options?: RateQueryOptions,
  ): Required<
    Pick<RateQueryOptions, "fallbackToPreviousDay" | "fallbackMaxLookbackDays">
  > {
    return {
      fallbackToPreviousDay:
        options?.fallbackToPreviousDay ?? this.defaultFallback,
      fallbackMaxLookbackDays:
        options?.fallbackMaxLookbackDays ?? this.defaultLookback,
    };
  }

  private async resolveSnapshotForDay(
    day: string,
    options?: RateQueryOptions,
  ): Promise<DailyForexSnapshot> {
    const opts = this.mergeQueryOptions(options);
    const primary = await this.fetchRangeCached(day, day);
    if (primary.length > 0 && primary[0]!.rates.length > 0) {
      return primary[0]!;
    }

    if (!opts.fallbackToPreviousDay) {
      throw new NrbRateNotFoundError(day);
    }

    let cursor = day;
    for (let i = 0; i < opts.fallbackMaxLookbackDays; i++) {
      cursor = shiftIsoDate(cursor, -1);
      const snaps = await this.fetchRangeCached(cursor, cursor);
      if (snaps.length > 0 && snaps[0]!.rates.length > 0) {
        return {
          ...snaps[0]!,
          rates: snaps[0]!.rates.map((r) => ({ ...r, isFallback: true })),
        };
      }
    }

    throw new NrbRateNotFoundError(day);
  }

  private cacheKey(from: string, to: string): string {
    return `nrb:rates:${from}:${to}`;
  }

  private async fetchRangeCached(
    from: string,
    to: string,
  ): Promise<DailyForexSnapshot[]> {
    const key = this.cacheKey(from, to);
    const cached = await resolveMaybePromise(
      this.cache.get<DailyForexSnapshot[]>(key),
    );
    if (cached) return cached;

    const existing = this.inflight.get(key);
    if (existing) return existing;

    const promise = this.fetchAllPages(from, to)
      .then(async (snapshots) => {
        // TTL: if the entire range is historical, cache forever; else use shortest day TTL
        const today = toIsoDate();
        const allHistorical = to < today;
        const ttl = allHistorical
          ? null
          : Math.min(
              ...snapshots.map((s) => cacheTtlMsForDate(s.date) ?? 86_400_000),
              cacheTtlMsForDate(to) ?? 86_400_000,
            );
        await resolveMaybePromise(this.cache.set(key, snapshots, ttl));
        return snapshots;
      })
      .finally(() => {
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  private async fetchAllPages(
    from: string,
    to: string,
  ): Promise<DailyForexSnapshot[]> {
    const all: DailyForexSnapshot[] = [];
    let page = 1;
    let pages = 1;

    do {
      const body = await this.fetchPage(from, to, page, DEFAULT_PER_PAGE);
      const payload = body.data?.payload ?? [];
      for (const day of payload) {
        all.push(parsePayloadDay(day));
      }
      pages = body.pagination?.pages ?? 1;
      page += 1;
    } while (page <= pages);

    all.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return all;
  }

  private async fetchPage(
    from: string,
    to: string,
    page: number,
    perPage: number,
  ): Promise<NrbRatesResponse> {
    if (perPage < 1 || perPage > 100) {
      throw new NrbValidationError("per_page must be between 1 and 100");
    }

    const url = new URL(`${this.baseUrl}/rates`);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));

    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await this.fetchImpl(url.toString(), {
          headers: { Accept: "application/json" },
        });

        let json: unknown;
        try {
          json = await res.json();
        } catch {
          throw new NrbApiError(
            `NRB API returned non-JSON (HTTP ${res.status})`,
            res.status,
          );
        }

        const body = json as NrbRatesResponse;

        if (!res.ok) {
          const validation = body?.errors?.validation;
          throw new NrbApiError(
            validation
              ? `NRB validation error: ${JSON.stringify(validation)}`
              : `NRB API HTTP ${res.status}`,
            res.status,
            body,
          );
        }

        if (body.status?.code !== 200) {
          throw new NrbApiError(
            `NRB API status.code ${body.status?.code ?? "missing"}`,
            body.status?.code,
            body,
          );
        }

        return body;
      } catch (err) {
        lastError = err;
        // Do not retry validation / 4xx API errors (except transient network)
        if (err instanceof NrbApiError && err.statusCode != null) {
          if (err.statusCode >= 400 && err.statusCode < 500) {
            throw err;
          }
        }
        if (err instanceof NrbValidationError) throw err;

        if (attempt >= this.maxRetries) break;
        const delay = this.retryBaseMs * 2 ** (attempt - 1);
        await sleep(delay);
      }
    }

    if (lastError instanceof NrbApiError) throw lastError;
    throw new NrbApiError(
      `NRB API request failed after ${this.maxRetries} attempts: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`,
    );
  }
}

let defaultClient: NrbForexClient | null = null;

export function createNrbForexClient(
  options?: NrbForexClientOptions,
): NrbForexClient {
  return new NrbForexClient(options);
}

export function getDefaultClient(): NrbForexClient {
  if (!defaultClient) defaultClient = new NrbForexClient();
  return defaultClient;
}

/** Replace the module singleton (useful in tests). */
export function setDefaultClient(client: NrbForexClient | null): void {
  defaultClient = client;
}

export async function getRate(
  currency: string,
  date?: Date | string,
  options?: RateQueryOptions,
): Promise<ForexRate> {
  return getDefaultClient().getRate(currency, date, options);
}

export async function getRatesForDate(
  date?: Date | string,
  options?: RateQueryOptions,
): Promise<ForexRate[]> {
  return getDefaultClient().getRatesForDate(date, options);
}

export async function getRateHistory(
  currency: string,
  from: Date | string,
  to: Date | string,
): Promise<ForexRate[]> {
  return getDefaultClient().getRateHistory(currency, from, to);
}

export async function getRatesInRange(
  from: Date | string,
  to: Date | string,
): Promise<DailyForexSnapshot[]> {
  return getDefaultClient().getRatesInRange(from, to);
}

export async function convert(
  amount: number,
  from: string,
  to: "NPR",
  options?: ConvertOptions,
): Promise<number> {
  return getDefaultClient().convert(amount, from, to, options);
}

export async function getSupportedCurrencies(
  date?: Date | string,
  options?: RateQueryOptions,
): Promise<CurrencyInfo[]> {
  return getDefaultClient().getSupportedCurrencies(date, options);
}
