import { NextResponse } from "next/server";
import { runDailyIngest } from "@itzsa/nepal-metal-rate/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Cron: scrape/API ingest → encrypt → DB.
 * Auth: Authorization: Bearer ${CRON_SECRET}
 * Schedule: vercel.json `0 3 * * *` ≈ 08:45 NST.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/ingest] CRON_SECRET is not configured");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const header = request.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const result = await runDailyIngest();
    if (!result.success) {
      console.error("[cron/ingest] ingest failed", {
        sourceUsed: result.sourceUsed,
        sourceId: result.sourceId,
        durationMs: result.durationMs,
        errorMsg: result.errorMsg,
      });
      return NextResponse.json({ ok: false }, { status: 502 });
    }

    console.info("[cron/ingest] ok", {
      sourceUsed: result.sourceUsed,
      sourceId: result.sourceId,
      upserted: result.upserted,
      recordCount: result.entries.length,
      durationMs: result.durationMs,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(
      "[cron/ingest] unexpected error",
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
