import { GatewayApiError, KhaltiGateway } from "@itzsa/nepal-pay";
import { NextResponse } from "next/server";

type Body = {
  pidx?: string;
  status?: string;
  amount?: string | number;
  mock?: boolean | string;
  secretKey?: string;
  query?: Record<string, string>;
};

/**
 * Verify Khalti return-URL query via lookup (or mock lookup for docs playground).
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "JSON body required" } },
      { status: 400 },
    );
  }

  const query = body.query ?? {};
  const pidx = String(body.pidx || query.pidx || "");
  const status = String(body.status || query.status || "");
  const isMock =
    body.mock === true ||
    body.mock === "1" ||
    query.mock === "1" ||
    pidx.startsWith("mock-");

  if (!pidx) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "CONFIG", message: "Missing pidx" },
        fulfill: "DO_NOT_FULFILL",
      },
      { status: 400 },
    );
  }

  // Untrusted callback parse (same rules as KhaltiGateway.handleCallback)
  const cancelled =
    status === "User canceled" ||
    status === "User cancelled" ||
    status.toLowerCase() === "canceled" ||
    status.toLowerCase() === "cancelled";

  if (cancelled) {
    return NextResponse.json({
      ok: true,
      stage: "callback",
      callback: {
        kind: "callback_cancelled",
        providerRef: pidx,
        reason: `Khalti status: ${status}`,
        raw: { pidx, status, ...query },
      },
      verification: null,
      fulfill: "DO_NOT_FULFILL",
    });
  }

  if (isMock) {
    const amountPaisa = Number(
      body.amount || query.amount || query.total_amount || 0,
    );
    const verification = {
      status: "confirmed" as const,
      providerRef: pidx,
      amount: amountPaisa / 100,
      transactionId: String(query.transaction_id || `mock-txn`),
      raw: {
        pidx,
        total_amount: amountPaisa,
        status: "Completed",
        transaction_id: query.transaction_id || "mock-txn",
        fee: 0,
        refunded: false,
        _mock: true,
      },
    };

    return NextResponse.json({
      ok: true,
      stage: "verified",
      live: false,
      note: "Mock lookup — for docs flow only. Live payments always call POST /epayment/lookup/.",
      callback: {
        kind: "callback_received",
        providerRef: pidx,
        raw: { pidx, status: status || "Completed", ...query },
      },
      verification,
      fulfill: "SAFE_TO_FULFILL",
    });
  }

  const secret =
    body.secretKey?.trim() || process.env.KHALTI_SECRET?.trim() || "";
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFIG",
          message:
            "KHALTI_SECRET (or secretKey) required to call live lookup. Re-initiate with a sandbox secret.",
        },
        fulfill: "DO_NOT_FULFILL",
      },
      { status: 400 },
    );
  }

  try {
    const gateway = new KhaltiGateway({
      mode: "sandbox",
      config: { secretKey: secret },
      timeoutMs: 15_000,
    });

    const callback = await gateway.handleCallback({
      pidx,
      status: status || "Completed",
      ...query,
    });

    if (callback.kind === "callback_cancelled") {
      return NextResponse.json({
        ok: true,
        stage: "callback",
        live: true,
        callback,
        verification: null,
        fulfill: "DO_NOT_FULFILL",
      });
    }

    const verification = await gateway.verify(pidx);

    return NextResponse.json({
      ok: true,
      stage: "verified",
      live: true,
      callback,
      verification,
      fulfill:
        verification.status === "confirmed"
          ? "SAFE_TO_FULFILL"
          : "DO_NOT_FULFILL",
    });
  } catch (err) {
    if (err instanceof GatewayApiError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: err.code,
            name: err.name,
            message: err.message,
            statusCode: err.statusCode,
            body: err.body,
          },
          fulfill: "DO_NOT_FULFILL",
        },
        {
          status:
            err.statusCode && err.statusCode >= 400 ? err.statusCode : 502,
        },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        error: {
          message: err instanceof Error ? err.message : String(err),
        },
        fulfill: "DO_NOT_FULFILL",
      },
      { status: 502 },
    );
  }
}
