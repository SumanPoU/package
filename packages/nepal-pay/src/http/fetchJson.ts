import { GatewayApiError } from "../core/errors";

export interface FetchJsonOptions {
  method?: string;
  headers?: HeadersInit;
  body?: string;
  /** Abort after this many ms. Default 15_000. */
  timeoutMs?: number;
  /** Extra attempts after the first failure (network / 5xx only). Default 0. */
  retries?: number;
  /** Delay before first retry; doubles each attempt. Default 250. */
  retryDelayMs?: number;
  fetchImpl?: typeof fetch;
  gateway: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/**
 * Shared fetch helper with timeout + limited retries.
 * Keeps gateway adapters thin and consistent under load.
 */
export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions,
): Promise<{ data: T; status: number }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const retries = options.retries ?? 0;
  let delay = options.retryDelayMs ?? 250;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(url, {
        method: options.method ?? "GET",
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
      });

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        clearTimeout(timer);
        throw new GatewayApiError(
          options.gateway,
          "Upstream returned non-JSON body",
          response.status,
        );
      }

      clearTimeout(timer);

      if (!response.ok) {
        if (attempt < retries && isRetryableStatus(response.status)) {
          await sleep(delay);
          delay *= 2;
          continue;
        }
        throw new GatewayApiError(
          options.gateway,
          `Request failed with HTTP ${response.status}`,
          response.status,
          data,
        );
      }

      return { data: data as T, status: response.status };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      if (err instanceof GatewayApiError) {
        throw err;
      }

      const aborted =
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("aborted"));

      if (attempt < retries && !aborted) {
        await sleep(delay);
        delay *= 2;
        continue;
      }

      throw new GatewayApiError(
        options.gateway,
        aborted
          ? `Request timed out after ${timeoutMs}ms`
          : `Network error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  throw new GatewayApiError(
    options.gateway,
    `Request failed after retries: ${lastError instanceof Error ? lastError.message : String(lastError)}`,
  );
}
