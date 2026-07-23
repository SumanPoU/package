import type { IncomingHttpHeaders } from "node:http";
import https from "node:https";

const DEFAULT_HOST = "www.nrb.org.np";

export type NrbHttpsFetchOptions = {
  /** Override NRB host (default `www.nrb.org.np`). */
  host?: string;
  /** Request timeout in ms (default 20_000). */
  timeoutMs?: number;
  /**
   * When true (default), skip TLS chain verification for the NRB host only.
   * NRB currently serves an incomplete certificate chain; Node's default
   * `fetch` fails with `unable to verify the first certificate`.
   */
  relaxTls?: boolean;
};

/**
 * Node-only `fetch` replacement for NRB.
 *
 * Use this as `createNrbForexClient({ fetch: createNrbHttpsFetch() })` when
 * calling NRB directly from Node/server runtimes. Not for browsers.
 */
export function createNrbHttpsFetch(
  options: NrbHttpsFetchOptions = {},
): typeof fetch {
  const host = options.host ?? DEFAULT_HOST;
  const timeoutMs = options.timeoutMs ?? 20_000;
  const relaxTls = options.relaxTls !== false;

  return async (input, init) => {
    const url =
      typeof input === "string"
        ? new URL(input)
        : input instanceof URL
          ? input
          : new URL(input.url);

    if (url.hostname !== host && !url.hostname.endsWith(`.${host}`)) {
      throw new Error(
        `createNrbHttpsFetch only allows ${host} (got ${url.hostname})`,
      );
    }

    const method = (init?.method ?? "GET").toUpperCase();
    if (method !== "GET" && method !== "HEAD") {
      throw new Error(
        `createNrbHttpsFetch only supports GET/HEAD (got ${method})`,
      );
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": "itzsa-nrb-forex/0.1 (+https://github.com/itzsa)",
    };
    if (init?.headers) {
      const h = new Headers(init.headers);
      h.forEach((value, key) => {
        headers[key] = value;
      });
    }

    const { statusCode, body, responseHeaders } = await new Promise<{
      statusCode: number;
      body: Buffer;
      responseHeaders: IncomingHttpHeaders;
    }>((resolve, reject) => {
      const req = https.request(
        {
          protocol: "https:",
          host: url.hostname,
          path: `${url.pathname}${url.search}`,
          method,
          headers,
          rejectUnauthorized: !relaxTls,
          servername: url.hostname,
          timeout: timeoutMs,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
          });
          res.on("end", () => {
            resolve({
              statusCode: res.statusCode ?? 502,
              body: Buffer.concat(chunks),
              responseHeaders: res.headers,
            });
          });
        },
      );

      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`NRB request timed out after ${timeoutMs}ms`));
      });
      req.on("error", reject);
      req.end();
    });

    const headerInit: Record<string, string> = {};
    for (const [key, value] of Object.entries(responseHeaders)) {
      if (value == null) continue;
      headerInit[key] = Array.isArray(value) ? value.join(", ") : value;
    }

    return new Response(new Uint8Array(body), {
      status: statusCode,
      headers: headerInit,
    });
  };
}
