/**
 * @fileoverview Public HTTP client — fetches rates from *our* API (or a
 * compatible user-provided baseUrl). Does not scrape FeNeGoSiDA.
 */

import {
  ApiOkHistorySchema,
  ApiOkLatestSchema,
  type Metal,
  type PublicRate,
} from "./contract/api";
import { DEFAULT_API_BASE_URL, DEFAULT_TIMEOUT_MS } from "./constants";
import {
  MetalRateHttpError,
  MetalRateNotFoundError,
  MetalRateValidationError,
} from "./errors";

export type MetalRateClientOptions = {
  /**
   * API root implementing the itzsa metal-rate v1 contract.
   * Default: itzsa hosted API. Pass your own backend URL to self-host.
   */
  baseUrl?: string;
  /** Optional Bearer token / API key sent as Authorization header. */
  apiKey?: string;
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
};

export type LatestQuery = {
  metal: Metal;
  series?: string;
};

export type HistoryQuery = {
  metal: Metal;
  from: string | Date;
  to: string | Date;
  series?: string;
};

const toDateString = (value: string | Date): string => {
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
};

const joinUrl = (base: string, path: string): string => {
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
};

/**
 * Create a client for the itzsa metal-rate HTTP API (or any compatible API).
 *
 * @example
 * ```ts
 * // Default — itzsa hosted API
 * const rates = createMetalRateClient();
 * await rates.getLatest({ metal: "GOLD" });
 *
 * // Bring your own compatible backend
 * const mine = createMetalRateClient({
 *   baseUrl: "https://api.mycompany.com/metal-rates/v1",
 *   apiKey: process.env.MY_API_KEY,
 * });
 * ```
 */
export const createMetalRateClient = (options: MetalRateClientOptions = {}) => {
  const baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
  const fetchImpl = options.fetch ?? globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const request = async (path: string, search: Record<string, string>) => {
    if (typeof fetchImpl !== "function") {
      throw new MetalRateHttpError("fetch is not available");
    }
    const url = new URL(joinUrl(baseUrl, path));
    for (const [k, v] of Object.entries(search)) {
      if (v) url.searchParams.set(k, v);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const headers: Record<string, string> = {
        Accept: "application/json",
      };
      if (options.apiKey) {
        headers.Authorization = `Bearer ${options.apiKey}`;
      }
      const res = await fetchImpl(url.toString(), {
        method: "GET",
        headers,
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new MetalRateHttpError(`HTTP ${res.status}`, res.status);
      }
      return (await res.json()) as unknown;
    } finally {
      clearTimeout(timer);
    }
  };

  const getLatest = async (query: LatestQuery): Promise<PublicRate | null> => {
    const json = await request("rates/latest", {
      metal: query.metal,
      series: query.series ?? "DOMESTIC",
    });
    const parsed = ApiOkLatestSchema.safeParse(json);
    if (!parsed.success) {
      throw new MetalRateValidationError(
        "API latest response failed contract validation",
      );
    }
    return parsed.data.data;
  };

  const getLatestOrThrow = async (query: LatestQuery): Promise<PublicRate> => {
    const row = await getLatest(query);
    if (!row) {
      throw new MetalRateNotFoundError(
        `No rate for ${query.metal}/${query.series ?? "DOMESTIC"}`,
      );
    }
    return row;
  };

  const getHistory = async (query: HistoryQuery): Promise<PublicRate[]> => {
    const json = await request("rates", {
      metal: query.metal,
      series: query.series ?? "DOMESTIC",
      from: toDateString(query.from),
      to: toDateString(query.to),
    });
    const parsed = ApiOkHistorySchema.safeParse(json);
    if (!parsed.success) {
      throw new MetalRateValidationError(
        "API history response failed contract validation",
      );
    }
    return parsed.data.data;
  };

  return {
    baseUrl,
    getLatest,
    getLatestOrThrow,
    getHistory,
  };
};

export type MetalRateClient = ReturnType<typeof createMetalRateClient>;

/** Module helpers using the default itzsa API. */
let defaultClient: MetalRateClient | null = null;

export const getDefaultClient = (): MetalRateClient => {
  if (!defaultClient) defaultClient = createMetalRateClient();
  return defaultClient;
};

export const setDefaultClient = (client: MetalRateClient): void => {
  defaultClient = client;
};

export const getLatestRate = (query: LatestQuery) =>
  getDefaultClient().getLatest(query);

export const getRateHistory = (query: HistoryQuery) =>
  getDefaultClient().getHistory(query);
