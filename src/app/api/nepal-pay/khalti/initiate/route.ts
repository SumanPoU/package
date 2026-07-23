import { GatewayApiError, KhaltiGateway, nprToPaisa } from "@itzsa/nepal-pay";
import { NextResponse } from "next/server";

type Body = {
  amount?: number;
  orderId?: string;
  orderName?: string;
  returnUrl?: string;
  websiteUrl?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  /** One-off playground secret (prefer env KHALTI_SECRET in production docs). */
  secretKey?: string;
  /** Force mock even if a secret is available. */
  mock?: boolean;
};

/**
 * Khalti initiate for the docs playground.
 * Mirrors eSewa: return URL → /nepal-pay/khalti-return for verify-on-return.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFIG",
          name: "ConfigError",
          message: "Request body must be JSON",
        },
      },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || !(amount > 10)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFIG",
          name: "ConfigError",
          message: "Khalti requires amount > Rs. 10 (NPR decimal)",
        },
      },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const orderId = (body.orderId?.trim() || `demo-${Date.now().toString(36)}`)
    .replace(/[^A-Za-z0-9_-]/g, "-")
    .slice(0, 40);
  const orderName = body.orderName?.trim() || "itzsa docs demo";
  const returnUrl =
    body.returnUrl?.trim() || `${origin}/nepal-pay/khalti-return`;
  const websiteUrl = body.websiteUrl?.trim() || origin;
  const amountPaisa = nprToPaisa(amount);

  const secret =
    body.secretKey?.trim() || process.env.KHALTI_SECRET?.trim() || "";
  const useMock = body.mock === true || !secret;

  const requestSent: Record<string, unknown> = {
    return_url: returnUrl,
    website_url: websiteUrl,
    amount: amountPaisa,
    purchase_order_id: orderId,
    purchase_order_name: orderName,
  };

  if (body.customerName || body.customerEmail || body.customerPhone) {
    requestSent.customer_info = {
      name: body.customerName || undefined,
      email: body.customerEmail || undefined,
      phone: body.customerPhone || "9800000000",
    };
  }

  const flow = [
    "1. Initiate → receive pidx + payment_url",
    "2. Browser GET redirect to payment_url",
    "3. Pay in Khalti sandbox (test ID / MPIN / OTP)",
    "4. Khalti redirects to return_url?pidx=&status=&amount=…",
    "5. Server POST /epayment/lookup/ — only Completed = fulfill",
  ];

  const testCredentials = {
    khaltiIds: [
      "9800000000",
      "9800000001",
      "9800000002",
      "9800000003",
      "9800000004",
      "9800000005",
    ],
    mpin: "1111",
    otp: "987654",
  };

  if (useMock) {
    const pidx = `mock-${orderId}`;
    return NextResponse.json({
      ok: true,
      gateway: "khalti",
      mode: "sandbox",
      live: false,
      amountNpr: amount,
      amountPaisa,
      testCredentials,
      flow,
      note: secret
        ? "mock=true — simulate return without charging. Uncheck mock for live."
        : "No secret yet — mock initiate. Paste a sandbox secret below or set KHALTI_SECRET, then uncheck mock for live redirect.",
      requestSent,
      initiate: {
        redirectUrl: `${origin}/nepal-pay/khalti-return?pidx=${encodeURIComponent(pidx)}&status=Completed&amount=${amountPaisa}&total_amount=${amountPaisa}&transaction_id=mock-txn-${orderId}&purchase_order_id=${encodeURIComponent(orderId)}&purchase_order_name=${encodeURIComponent(orderName)}&mock=1`,
        providerRef: pidx,
        method: "GET" as const,
      },
      upstream: {
        pidx,
        payment_url: `https://test-pay.khalti.com/?pidx=${pidx}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        expires_in: 1800,
      },
      simulateReturnUrl: `${origin}/nepal-pay/khalti-return?pidx=${encodeURIComponent(pidx)}&status=Completed&amount=${amountPaisa}&total_amount=${amountPaisa}&transaction_id=mock-txn-${orderId}&purchase_order_id=${encodeURIComponent(orderId)}&purchase_order_name=${encodeURIComponent(orderName)}&mock=1`,
    });
  }

  try {
    const gateway = new KhaltiGateway({
      mode: "sandbox",
      config: { secretKey: secret },
      timeoutMs: 15_000,
    });

    const initiate = await gateway.initiate({
      amount,
      orderId,
      orderName,
      returnUrl,
      websiteUrl,
      customer: {
        name: body.customerName,
        email: body.customerEmail,
        phone: body.customerPhone || "9800000000",
      },
    });

    return NextResponse.json({
      ok: true,
      gateway: "khalti",
      mode: "sandbox",
      live: true,
      amountNpr: amount,
      amountPaisa,
      testCredentials,
      flow,
      requestSent,
      initiate,
      note: "Click Pay — browser opens Khalti sandbox. After payment you return to /nepal-pay/khalti-return for lookup verify.",
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
            gateway: err.gateway,
            statusCode: err.statusCode,
            body: err.body,
          },
          requestSent,
          testCredentials,
          flow,
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
          code: "CONFIG",
          name: err instanceof Error ? err.name : "Error",
          message: err instanceof Error ? err.message : String(err),
        },
        requestSent,
      },
      { status: 400 },
    );
  }
}
