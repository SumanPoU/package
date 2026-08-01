import { NextResponse } from "next/server";
import { MetalSchema } from "@itzsa/nepal-metal-rate";
import { getRateHistory } from "@itzsa/nepal-metal-rate/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/nepal-metal-rate/v1/rates?metal=GOLD&from=2026-07-01&to=2026-07-31&series=DOMESTIC
 */
export async function GET(request: Request) {
  const apiKey = process.env.METAL_RATE_API_KEY;
  if (apiKey) {
    const header = request.headers.get("authorization");
    if (header !== `Bearer ${apiKey}`) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  }

  try {
    const { searchParams } = new URL(request.url);
    const metalRaw = searchParams.get("metal") ?? "GOLD";
    const series = searchParams.get("series") ?? "DOMESTIC";
    const fromRaw = searchParams.get("from");
    const toRaw = searchParams.get("to");

    const metalParsed = MetalSchema.safeParse(metalRaw);
    if (!metalParsed.success) {
      return NextResponse.json({ ok: false, error: "invalid metal" }, { status: 400 });
    }
    if (!fromRaw || !toRaw) {
      return NextResponse.json(
        { ok: false, error: "from and to (YYYY-MM-DD) required" },
        { status: 400 },
      );
    }

    const from = new Date(`${fromRaw}T00:00:00.000Z`);
    const to = new Date(`${toRaw}T00:00:00.000Z`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return NextResponse.json({ ok: false, error: "invalid dates" }, { status: 400 });
    }

    const data = await getRateHistory(metalParsed.data, from, to, { series });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error(
      "[metal-rate/history]",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
