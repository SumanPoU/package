import { afterEach, describe, expect, it, vi } from "vitest";
import { GatewayApiError } from "../src/core/errors";
import {
  KhaltiGateway,
  mapKhaltiStatusForTest,
  nprToPaisa,
} from "../src/gateways/khalti/KhaltiGateway";

function makeGateway(fetchImpl?: typeof fetch, secretKey = "test-secret") {
  return new KhaltiGateway({
    mode: "sandbox",
    config: { secretKey },
    fetchImpl,
  });
}

describe("khalti gateway", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("converts NPR decimal to paisa correctly (10.50 → 1050)", () => {
    expect(nprToPaisa(10.5)).toBe(1050);
    expect(nprToPaisa(10.5)).not.toBe(10.5);
    expect(nprToPaisa(100)).toBe(10000);
  });

  it("sends amount in paisa on initiate (public API 10.50 NPR → 1050)", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    const fetchImpl = vi.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        capturedBody = JSON.parse(String(init?.body)) as Record<
          string,
          unknown
        >;
        return Response.json({
          pidx: "pidx-abc",
          payment_url: "https://test-pay.khalti.com/?pidx=pidx-abc",
          expires_in: 1800,
        });
      },
    ) as unknown as typeof fetch;

    const gw = makeGateway(fetchImpl);
    const result = await gw.initiate({
      amount: 10.5,
      orderId: "ord-1",
      orderName: "Widget",
      returnUrl: "https://merchant.test/return",
      websiteUrl: "https://merchant.test",
    });

    expect(capturedBody?.amount).toBe(1050);
    expect(result.providerRef).toBe("pidx-abc");
    expect(result.method).toBe("GET");
    expect(result.redirectUrl).toContain("pidx=pidx-abc");
  });

  it("uses Authorization: Key <secret> (not Bearer)", async () => {
    let auth: string | null = null;
    const fetchImpl = vi.fn(
      async (_url: string | URL | Request, init?: RequestInit) => {
        const headers = new Headers(init?.headers);
        auth = headers.get("Authorization");
        return Response.json({
          pidx: "pidx-1",
          payment_url: "https://test-pay.khalti.com/?pidx=pidx-1",
        });
      },
    ) as unknown as typeof fetch;

    await makeGateway(fetchImpl, "live-secret-xyz").initiate({
      amount: 20,
      orderId: "ord-2",
      orderName: "Item",
      returnUrl: "https://merchant.test/return",
      websiteUrl: "https://merchant.test",
    });

    expect(auth).toBe("Key live-secret-xyz");
    expect(auth).not.toMatch(/^Bearer/);
  });

  it("maps every documented Khalti lookup status", () => {
    expect(mapKhaltiStatusForTest("Completed")).toBe("confirmed");
    expect(mapKhaltiStatusForTest("Pending")).toBe("pending");
    expect(mapKhaltiStatusForTest("Initiated")).toBe("pending");
    expect(mapKhaltiStatusForTest("Refunded")).toBe("refunded");
    expect(mapKhaltiStatusForTest("Expired")).toBe("failed");
    expect(mapKhaltiStatusForTest("User canceled")).toBe("failed");
    expect(mapKhaltiStatusForTest("Partially refunded")).toBe(
      "partially_refunded",
    );
  });

  it("verify() calls lookup and maps Completed", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        pidx: "pidx-abc",
        total_amount: 1050,
        status: "Completed",
        transaction_id: "txn-1",
      }),
    ) as unknown as typeof fetch;

    const result = await makeGateway(fetchImpl).verify("pidx-abc");
    expect(result.status).toBe("confirmed");
    expect(result.amount).toBe(10.5);
    expect(result.transactionId).toBe("txn-1");
  });

  it("handleCallback never returns confirmed — cancel maps to callback_cancelled", async () => {
    const result = await makeGateway().handleCallback({
      pidx: "pidx-x",
      status: "User canceled",
    });
    expect(result.kind).toBe("callback_cancelled");
  });

  it("incorrect auth / API error produces typed GatewayApiError", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ detail: "Invalid token." }, { status: 401 }),
    ) as unknown as typeof fetch;

    const gw = makeGateway(fetchImpl, "bad-key");
    await expect(
      gw.initiate({
        amount: 20,
        orderId: "ord-3",
        orderName: "Item",
        returnUrl: "https://merchant.test/return",
        websiteUrl: "https://merchant.test",
      }),
    ).rejects.toBeInstanceOf(GatewayApiError);

    try {
      await gw.verify("pidx-fail");
    } catch (err) {
      expect(err).toBeInstanceOf(GatewayApiError);
      if (err instanceof GatewayApiError) {
        expect(err.gateway).toBe("khalti");
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe("GATEWAY_API");
      }
    }
  });
});
