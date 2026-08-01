import { NextResponse } from "next/server";
import { MetalSchema } from "@itzsa/nepal-metal-rate";
import { getLatestRate } from "@itzsa/nepal-metal-rate/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/nepal-metal-rate/v1/rates/latest?metal=GOLD&series=DOMESTIC
 * Optional: Authorization: Bearer ${METAL_RATE_API_KEY} when key is set.
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
    const metalParsed = MetalSchema.safeParse(metalRaw);
    if (!metalParsed.success) {
      return NextResponse.json({ ok: false, error: "invalid metal" }, { status: 400 });
    }

    const data = await getLatestRate(metalParsed.data, { series });
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error(
      "[metal-rate/latest]",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
