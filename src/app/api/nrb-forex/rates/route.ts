import { NextResponse } from "next/server";

const UPSTREAM = "https://www.nrb.org.np/api/forex/v1/rates";
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
  // Soft 2h for today (revisions); 7d for closed days.
  const revalidate = historical ? 7 * 24 * 60 * 60 : 2 * 60 * 60;
  const sMaxAge = historical ? 24 * 60 * 60 : 30 * 60;
  const swr = historical ? 7 * 24 * 60 * 60 : 2 * 60 * 60;

  const upstream = new URL(UPSTREAM);
  upstream.searchParams.set("from", from);
  upstream.searchParams.set("to", to);
  upstream.searchParams.set("page", page);
  upstream.searchParams.set("per_page", perPage);

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    const body: unknown = await res.json();
    return NextResponse.json(body, {
      status: res.status,
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
          // Don't cache failures for long.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60",
        },
      },
    );
  }
}
