/**
 * Shared timed fetch with exponential backoff (server / ingest only).
 */

import {
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_BASE_MS,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_USER_AGENT,
} from "../constants";
import { MetalRateHttpError } from "../errors";
import type { FetchLike } from "../types";

export type FetchWithRetryOptions = {
  url: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseMs?: number;
  signal?: AbortSignal;
  headers?: Record<string, string>;
  accept?: string;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const isRetryable = (status: number): boolean =>
  status === 408 || status === 429 || status >= 500;

export const fetchWithRetry = async (
  options: FetchWithRetryOptions,
): Promise<Response> => {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    throw new MetalRateHttpError("fetch is not available");
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const retryBaseMs = options.retryBaseMs ?? DEFAULT_RETRY_BASE_MS;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    options.signal?.addEventListener("abort", onAbort);

    try {
      const res = await fetchImpl(options.url, {
        method: "GET",
        headers: {
          Accept: options.accept ?? "application/json",
          "User-Agent": DEFAULT_USER_AGENT,
          Origin: "https://www.fenegosida.org",
          Referer: "https://www.fenegosida.org/",
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!res.ok && isRetryable(res.status) && attempt < maxRetries) {
        lastError = new MetalRateHttpError(
          `HTTP ${res.status}`,
          res.status,
        );
        await sleep(retryBaseMs * 2 ** (attempt - 1));
        continue;
      }

      if (!res.ok) {
        throw new MetalRateHttpError(`HTTP ${res.status}`, res.status);
      }

      return res;
    } catch (err) {
      lastError = err;
      if (attempt >= maxRetries) break;
      const retryable =
        err instanceof MetalRateHttpError
          ? isRetryable(err.statusCode ?? 0)
          : true;
      if (!retryable) throw err;
      await sleep(retryBaseMs * 2 ** (attempt - 1));
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    }
  }

  if (lastError instanceof MetalRateHttpError) throw lastError;
  throw new MetalRateHttpError(
    lastError instanceof Error ? lastError.message : "request failed",
  );
};

export const fetchJson = async <T = unknown>(
  options: FetchWithRetryOptions,
): Promise<T> => {
  const res = await fetchWithRetry({
    ...options,
    accept: options.accept ?? "application/json",
  });
  return (await res.json()) as T;
};

export const fetchText = async (
  options: FetchWithRetryOptions,
): Promise<string> => {
  const res = await fetchWithRetry({
    ...options,
    accept: options.accept ?? "text/html,application/json",
  });
  return res.text();
};
