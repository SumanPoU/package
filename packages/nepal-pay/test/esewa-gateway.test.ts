import { afterEach, describe, expect, it, vi } from "vitest";
import { SignatureMismatchError } from "../src/core/errors";
import {
  EsewaGateway,
  mapEsewaStatusForTest,
} from "../src/gateways/esewa/EsewaGateway";
import { buildSignedMessage, sign } from "../src/gateways/esewa/signature";

const UAT_SECRET = "8gBm/:&EnhH.1/q";

function makeGateway(fetchImpl?: typeof fetch) {
  return new EsewaGateway({
    mode: "sandbox",
    config: { productCode: "EPAYTEST", secretKey: UAT_SECRET },
    fetchImpl,
  });
}

describe("esewa gateway", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("builds a signed form POST initiate payload", async () => {
    const gw = makeGateway();
    const result = await gw.initiate({
      amount: 110,
      taxAmount: 0,
      orderId: "order-1",
      orderName: "Test",
      returnUrl: "https://merchant.test/success",
      websiteUrl: "https://merchant.test",
      failureUrl: "https://merchant.test/fail",
      metadata: { transaction_uuid: "241028" },
    });

    expect(result.method).toBe("POST");
    expect(result.providerRef).toBe("241028");
    expect(result.redirectUrl).toContain("rc-epay.esewa.com.np");
    expect(result.formFields?.total_amount).toBe("110");
    expect(result.formFields?.product_code).toBe("EPAYTEST");
    expect(result.formFields?.signature).toBe(
      "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=",
    );
  });

  it("rejects a tampered callback payload (mismatched signature)", async () => {
    const gw = makeGateway();
    const payload = {
      transaction_code: "000AWEO",
      status: "COMPLETE",
      total_amount: 1000.0,
      transaction_uuid: "250610-162413",
      product_code: "EPAYTEST",
      signed_field_names:
        "transaction_code,status,total_amount,transaction_uuid,product_code",
      signature: "tampered-signature-value=================",
    };
    const data = Buffer.from(JSON.stringify(payload)).toString("base64");

    await expect(gw.handleCallback({ data })).rejects.toBeInstanceOf(
      SignatureMismatchError,
    );
  });

  it("accepts a valid signed callback as callback_received (never confirmed)", async () => {
    const gw = makeGateway();
    const fields = {
      transaction_code: "000AWEO",
      status: "COMPLETE",
      total_amount: 1000.0,
      transaction_uuid: "250610-162413",
      product_code: "EPAYTEST",
      signed_field_names:
        "transaction_code,status,total_amount,transaction_uuid,product_code",
    };
    const signature = sign(
      buildSignedMessage(fields, fields.signed_field_names.split(",")),
      UAT_SECRET,
    );
    const data = Buffer.from(JSON.stringify({ ...fields, signature })).toString(
      "base64",
    );

    const result = await gw.handleCallback({ data });
    expect(result.kind).toBe("callback_received");
    if (result.kind === "callback_received") {
      expect(result.providerRef).toBe("250610-162413");
    }
    // Type-level: result has no confirmed field — runtime check of kind union.
    expect(result).not.toHaveProperty("status", "confirmed");
  });

  it("maps every documented eSewa status check value", () => {
    expect(mapEsewaStatusForTest("COMPLETE")).toBe("confirmed");
    expect(mapEsewaStatusForTest("PENDING")).toBe("pending");
    expect(mapEsewaStatusForTest("AMBIGUOUS")).toBe("pending");
    expect(mapEsewaStatusForTest("CANCELED")).toBe("failed");
    expect(mapEsewaStatusForTest("NOT_FOUND")).toBe("failed");
    expect(mapEsewaStatusForTest("FULL_REFUND")).toBe("refunded");
    expect(mapEsewaStatusForTest("PARTIAL_REFUND")).toBe("partially_refunded");
  });

  it("verify() calls status API and maps COMPLETE → confirmed", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        product_code: "EPAYTEST",
        transaction_uuid: "11-201-13",
        total_amount: 100,
        status: "COMPLETE",
        ref_id: "000ABC",
      }),
    ) as unknown as typeof fetch;

    const gw = makeGateway(fetchImpl);
    const result = await gw.verify("11-201-13", { amount: 100 });
    expect(result.status).toBe("confirmed");
    expect(result.transactionId).toBe("000ABC");
    expect(fetchImpl).toHaveBeenCalledOnce();
    const calledUrl = String(vi.mocked(fetchImpl).mock.calls[0]?.[0]);
    expect(calledUrl).toContain("product_code=EPAYTEST");
    expect(calledUrl).toContain("transaction_uuid=11-201-13");
    expect(calledUrl).toContain("total_amount=100");
  });
});
