import { ConnectIpsGateway, type VerificationResult } from "@itzsa/nepal-pay";
import { NextResponse } from "next/server";

type Body = {
  TXNID?: string;
  txnid?: string;
  amount?: number | string;
  mock?: boolean | string;
  outcome?: string;
  cancelled?: string;
  merchantId?: string | number;
  appId?: string;
  appName?: string;
  password?: string;
  privateKeyPem?: string;
};

/**
 * Docs return-page verify for connectIPS.
 * Mock: TXNID + mock → synthetic SUCCESS (no NCHL call).
 * Live: validatetxn when CONNECTIPS_PEM / body PEM is present.
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

  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries(body)) {
    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      query[k] = String(v);
    }
  }

  const txnId = String(body.TXNID || body.txnid || "").trim();
  const amount = Number(body.amount);
  const outcome = (body.outcome ?? "").toLowerCase();
  const privateKeyPem =
    body.privateKeyPem?.trim() || process.env.CONNECTIPS_PEM?.trim() || "";
  const forceMock =
    body.mock === true || body.mock === "1" || body.mock === "true";
  const isMock = forceMock || !privateKeyPem;

  if (
    outcome === "failure" ||
    outcome === "failed" ||
    body.cancelled === "true"
  ) {
    return NextResponse.json({
      ok: true,
      stage: "callback",
      callback: {
        kind: "callback_cancelled",
        providerRef: txnId || undefined,
        reason: "connectIPS failure / cancel return",
        raw: query,
      },
      verification: null,
      fulfill: "DO_NOT_FULFILL",
    });
  }

  if (!txnId) {
    return NextResponse.json({
      ok: true,
      stage: "callback",
      callback: {
        kind: "callback_cancelled",
        reason: "Missing TXNID in connectIPS callback",
        raw: query,
      },
      verification: null,
      fulfill: "DO_NOT_FULFILL",
    });
  }

  const callback = {
    kind: "callback_received" as const,
    providerRef: txnId,
    raw: query,
  };

  if (isMock) {
    if (!Number.isFinite(amount) || !(amount > 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message: "mock verify requires amount (NPR) alongside TXNID",
          },
          callback,
          fulfill: "DO_NOT_FULFILL",
        },
        { status: 400 },
      );
    }

    const verification: VerificationResult = {
      status: "confirmed",
      providerRef: txnId,
      amount,
      transactionId: `mock-${txnId}`,
      raw: {
        mock: true,
        status: "SUCCESS",
        statusDesc: "Mock validatetxn — docs playground",
        referenceId: txnId,
        txnAmt: Math.round(amount * 100),
      },
    };

    return NextResponse.json({
      ok: true,
      stage: "verified",
      live: false,
      callback,
      verification,
      fulfill: "SAFE_TO_FULFILL",
      note: "Mock validatetxn SUCCESS. Live UAT needs CONNECTIPS_PEM + merchant credentials.",
    });
  }

  try {
    const gateway = new ConnectIpsGateway({
      mode: "sandbox",
      config: {
        merchantId:
          body.merchantId ?? process.env.CONNECTIPS_MERCHANT_ID ?? "902",
        appId:
          body.appId?.trim() || process.env.CONNECTIPS_APP_ID || "MER-DEMO-APP",
        appName:
          body.appName?.trim() ||
          process.env.CONNECTIPS_APP_NAME ||
          "itzsa docs",
        password:
          body.password?.trim() ||
          process.env.CONNECTIPS_PASSWORD ||
          "demo-password",
        privateKeyPem,
      },
    });

    const parsed = await gateway.handleCallback(query);
    if (parsed.kind === "callback_cancelled") {
      return NextResponse.json({
        ok: true,
        stage: "callback",
        live: true,
        callback: parsed,
        verification: null,
        fulfill: "DO_NOT_FULFILL",
      });
    }

    if (!Number.isFinite(amount) || !(amount > 0)) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            message:
              "connectips verify requires amount (NPR) — pass from your payment store",
          },
          callback: parsed,
          fulfill: "DO_NOT_FULFILL",
        },
        { status: 400 },
      );
    }

    const verification = await gateway.verify(parsed.providerRef, { amount });

    return NextResponse.json({
      ok: true,
      stage: "verified",
      live: true,
      callback: parsed,
      verification,
      fulfill:
        verification.status === "confirmed"
          ? "SAFE_TO_FULFILL"
          : "DO_NOT_FULFILL",
    });
  } catch (err) {
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
