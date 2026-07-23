import https from "node:https";
import { NextResponse } from "next/server";

const UPSTREAM_HOST = "www.nrb.org.np";
const UPSTREAM_PATH = "/api/forex/v1/rates";
const NST = "Asia/Kathmandu";

/** YYYY-MM-DD in Nepal Standard Time (NRB business calendar). */
function todayNst(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * NRB currently serves an incomplete TLS certificate chain, so Node's default
 * `fetch` fails with `unable to verify the first certificate` and our proxy
 * returned HTTP 502. Scope TLS relaxation to this host only.
 */
function fetchNrbRates(
  search: string,
  timeoutMs = 20_000,
): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host: UPSTREAM_HOST,
        path: `${UPSTREAM_PATH}?${search}`,
        headers: {
          Accept: "application/json",
          "User-Agent":
            "itzsa-nrb-forex/0.1 (+https://itzsa.acharya-suman.com.np)",
        },
        // NRB cert chain is incomplete — verified 2026-07 against sandbox/docs.
        rejectUnauthorized: false,
        servername: UPSTREAM_HOST,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          const status = res.statusCode ?? 502;
          try {
            resolve({ status, body: JSON.parse(text) as unknown });
          } catch {
            reject(
              new Error(
                `NRB returned non-JSON (HTTP ${status}): ${text.slice(0, 120)}`,
              ),
            );
          }
        });
      },
    );

    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`NRB request timed out after ${timeoutMs}ms`));
    });
    req.on("error", reject);
  });
}

async function fetchNrbWithRetry(
  search: string,
  attempts = 3,
): Promise<{ status: number; body: unknown }> {
  let lastError: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetchNrbRates(search);
    } catch (err) {
      lastError = err;
      if (i < attempts) {
        await new Promise((r) => setTimeout(r, 200 * 2 ** (i - 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

/**
 * Browser-safe proxy for NRB forex (no CORS on the official host).
 *
 * Caching strategy (matches NRB publish habits):
 * - Historical ranges (`to` before today NST): long CDN + Next cache — immutable.
 * - Ranges that include today: soft ~2h revalidate so rare midday revisions land
 *   without hitting NRB on every page refresh.
 */
export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const from = incoming.searchParams.get("from");
  const to = incoming.searchParams.get("to");
  const page = incoming.searchParams.get("page") ?? "1";
  const perPage = incoming.searchParams.get("per_page") ?? "100";

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to (YYYY-MM-DD) are required" },
      { status: 400 },
    );
  }

  const historical = to < todayNst();
  const sMaxAge = historical ? 24 * 60 * 60 : 30 * 60;
  const swr = historical ? 7 * 24 * 60 * 60 : 2 * 60 * 60;

  const params = new URLSearchParams({
    from,
    to,
    page,
    per_page: perPage,
  });

  try {
    const { status, body } = await fetchNrbWithRetry(params.toString());
    return NextResponse.json(body, {
      status,
      headers: {
        "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
        "CDN-Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
        Vary: "Accept",
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to reach NRB forex API",
        detail: err instanceof Error ? err.message : String(err),
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=30",
        },
      },
    );
  }
}
