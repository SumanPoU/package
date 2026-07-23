import {
  ESEWA_UAT_PRODUCT_CODE,
  ESEWA_UAT_SECRET_KEY,
  EsewaGateway,
  SignatureMismatchError,
  verifySignature,
} from "@itzsa/nepal-pay";
import { NextResponse } from "next/server";

/**
 * Server-side verify for the docs return page.
 * Body: { data: base64Callback } OR flat callback fields + optional skipStatus.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: { message: "JSON body required" } },
      { status: 400 },
    );
  }

  const gateway = new EsewaGateway({
    mode: "sandbox",
    config: {
      productCode: ESEWA_UAT_PRODUCT_CODE,
      secretKey: ESEWA_UAT_SECRET_KEY,
    },
  });

  const query: Record<string, string> = {};
  if (typeof body.data === "string") {
    query.data = body.data;
  } else {
    for (const [k, v] of Object.entries(body)) {
      if (typeof v === "string" || typeof v === "number") {
        query[k] = String(v);
      }
    }
  }

  try {
    const callback = await gateway.handleCallback(query);

    if (callback.kind === "callback_cancelled") {
      return NextResponse.json({
        ok: true,
        stage: "callback",
        callback,
        verification: null,
      });
    }

    // Explicit signature check on decoded fields for the docs UI
    const signedFieldNames = callback.raw.signed_field_names;
    const signature = callback.raw.signature;
    let signatureValid: boolean | null = null;
    if (signedFieldNames && signature) {
      signatureValid = verifySignature(
        callback.raw,
        signedFieldNames,
        signature,
        ESEWA_UAT_SECRET_KEY,
      );
    }

    const amount = Number(callback.raw.total_amount);
    let verification = null;
    if (Number.isFinite(amount) && amount > 0) {
      verification = await gateway.verify(callback.providerRef, {
        amount,
        callbackPayload: callback.raw,
      });
    }

    return NextResponse.json({
      ok: true,
      stage: "verified",
      signatureValid,
      callback,
      verification,
      fulfill:
        verification?.status === "confirmed"
          ? "SAFE_TO_FULFILL"
          : "DO_NOT_FULFILL",
    });
  } catch (err) {
    if (err instanceof SignatureMismatchError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: err.code,
            name: err.name,
            message: err.message,
          },
          fulfill: "DO_NOT_FULFILL",
        },
        { status: 400 },
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
