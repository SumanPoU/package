import {
  ESEWA_UAT_PRODUCT_CODE,
  ESEWA_UAT_SECRET_KEY,
  EsewaGateway,
} from "@itzsa/nepal-pay";
import { NextResponse } from "next/server";

type Body = {
  amount?: number;
  taxAmount?: number;
  serviceCharge?: number;
  deliveryCharge?: number;
  orderId?: string;
  orderName?: string;
  returnUrl?: string;
  failureUrl?: string;
  websiteUrl?: string;
};

/**
 * Docs playground: sign an eSewa ePay v2 form with working UAT credentials.
 * Returns form action + fields for a real HTML POST to the sandbox.
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
  if (!Number.isFinite(amount) || !(amount > 0)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFIG",
          name: "ConfigError",
          message: "amount must be a positive NPR decimal",
        },
      },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  // Alphanumeric + hyphen only (eSewa requirement). Avoid raw timestamps alone.
  const stamp = Date.now().toString(36);
  const orderId = (body.orderId?.trim() || `demo-${stamp}`)
    .replace(/[^A-Za-z0-9-]/g, "-")
    .slice(0, 40);

  // Dedicated return page — do not use hash URLs (query `data` must be preserved).
  const returnUrl = body.returnUrl?.trim() || `${origin}/nepal-pay/return`;
  const failureUrl =
    body.failureUrl?.trim() || `${origin}/nepal-pay/return?failed=1`;

  try {
    const gateway = new EsewaGateway({
      mode: "sandbox",
      config: {
        productCode: ESEWA_UAT_PRODUCT_CODE,
        secretKey: ESEWA_UAT_SECRET_KEY,
      },
    });

    const initiate = await gateway.initiate({
      amount,
      taxAmount: Number(body.taxAmount) || 0,
      serviceCharge: Number(body.serviceCharge) || 0,
      deliveryCharge: Number(body.deliveryCharge) || 0,
      orderId,
      orderName: body.orderName?.trim() || "itzsa docs demo",
      returnUrl,
      failureUrl,
      websiteUrl: body.websiteUrl?.trim() || origin,
      metadata: {
        // Stable uuid for this initiate so the form + store can align
        transaction_uuid: orderId,
      },
    });

    return NextResponse.json({
      ok: true,
      gateway: "esewa",
      mode: "sandbox",
      productCode: ESEWA_UAT_PRODUCT_CODE,
      signedMessage: `total_amount=${initiate.formFields?.total_amount},transaction_uuid=${initiate.providerRef},product_code=${ESEWA_UAT_PRODUCT_CODE}`,
      initiate,
      flow: [
        "1. Inspect signed form fields below",
        "2. Click Pay with eSewa — browser POSTs to rc-epay.esewa.com.np",
        "3. Login UAT: 9711111111 / Nepal@123 / token 123456",
        "4. eSewa redirects to /nepal-pay/return?data=… (base64 callback)",
        "5. Return page verifies signature + optionally status API",
      ],
      note: "UAT secret is 8gBm/:&EnhH.1/q (no trailing parenthesis). Docs that include '(' cause ES104.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "CONFIG";
    const name = err instanceof Error ? err.name : "Error";
    return NextResponse.json(
      {
        ok: false,
        error: { code, name, message },
      },
      { status: 400 },
    );
  }
}
