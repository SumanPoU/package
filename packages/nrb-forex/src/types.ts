/** ISO 4217 alpha-3 currency code, e.g. "USD". */
export type CurrencyCode = string;

export type ForexSide = "buy" | "sell" | "mid";

export interface CurrencyInfo {
  iso3: CurrencyCode;
  name: string;
  unit: number;
}

export interface ForexRate {
  /** ISO3, e.g. "USD". */
  currency: CurrencyCode;
  currencyName: string;
  /**
   * Units the buy/sell figures are quoted per (as published by NRB).
   * Often 1; historically/currently 10 (JPY) or 100 (INR, KRW).
   * Always divide buy/sell by `unit` for a per-1-unit NPR rate.
   */
  unit: number;
  /** Buy rate as published (for `unit` units of foreign currency). */
  buy: number;
  /** Sell rate as published (for `unit` units of foreign currency). */
  sell: number;
  /** Effective rate date `YYYY-MM-DD`. */
  date: string;
  publishedOn: string;
  /** True when returned via `fallbackToPreviousDay`. */
  isFallback?: boolean;
}

/** All currencies published for one business day. */
export interface DailyForexSnapshot {
  date: string;
  publishedOn: string;
  modifiedOn: string;
  rates: ForexRate[];
}

export interface RateQueryOptions {
  /**
   * If no rates exist for the requested date (weekend/holiday), walk back
   * calendar days until a published snapshot is found.
   * Default: false (throw `NrbRateNotFoundError`).
   */
  fallbackToPreviousDay?: boolean;
  /** Max days to look back when falling back (default 14). */
  fallbackMaxLookbackDays?: number;
}

export interface ConvertOptions extends RateQueryOptions {
  date?: Date | string;
  side?: ForexSide;
}

/** Pluggable cache — swap in Redis etc. on the server. */
export interface ForexCache {
  get<T>(key: string): Promise<T | undefined> | T | undefined;
  set<T>(key: string, value: T, ttlMs?: number | null): Promise<void> | void;
  has(key: string): Promise<boolean> | boolean;
  delete?(key: string): Promise<void> | void;
  clear?(): Promise<void> | void;
}

export interface NrbForexClientOptions {
  /** Override API root (default official NRB v1 forex base). */
  baseUrl?: string;
  cache?: ForexCache;
  /** Injected fetch (tests / custom agents). */
  fetch?: typeof globalThis.fetch;
  /** Network retry attempts (default 3). */
  maxRetries?: number;
  /** Base delay ms for exponential backoff (default 200). */
  retryBaseMs?: number;
  /** Default fallback behavior for date queries. */
  fallbackToPreviousDay?: boolean;
  fallbackMaxLookbackDays?: number;
}

/** Raw NRB API shapes (subset we rely on). */
export interface NrbRawCurrency {
  iso3: string;
  name: string;
  unit: number;
}

export interface NrbRawRate {
  currency: NrbRawCurrency;
  buy: string;
  sell: string;
}

export interface NrbRawPayloadDay {
  date: string;
  published_on: string;
  modified_on: string;
  rates: NrbRawRate[];
}

export interface NrbRatesResponse {
  status: { code: number };
  errors?: { validation?: unknown };
  data?: { payload?: NrbRawPayloadDay[] };
  pagination?: {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    links?: { prev?: string | null; next?: string | null };
  };
}
