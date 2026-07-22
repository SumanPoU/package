import { NextResponse } from "next/server";

const UPSTREAM = "https://www.nrb.org.np/api/forex/v1/rates";

/**
 * Browser-safe proxy for NRB forex (no CORS on the official host).
 * Forwards required query params: from, to, page, per_page.
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

  const upstream = new URL(UPSTREAM);
  upstream.searchParams.set("from", from);
  upstream.searchParams.set("to", to);
  upstream.searchParams.set("page", page);
  upstream.searchParams.set("per_page", perPage);

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    const body: unknown = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to reach NRB forex API",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
