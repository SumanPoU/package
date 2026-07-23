import { describe, expect, it, vi } from "vitest";
import { formatNprAmount, nprToPaisa } from "../src/core/amount";
import { GatewayApiError } from "../src/core/errors";
import type { PaymentGateway } from "../src/core/PaymentGateway";
import { createPaymentService } from "../src/flow/PaymentService";
import { fetchJson } from "../src/http/fetchJson";
import {
  listRegisteredGateways,
  registerGateway,
} from "../src/registry/GatewayRegistry";
import { MemoryPaymentStore } from "../src/store/adapters/MemoryPaymentStore";

describe("amount helpers", () => {
  it("formats and converts consistently", () => {
    expect(nprToPaisa(10.5)).toBe(1050);
    expect(formatNprAmount(100)).toBe("100");
    expect(formatNprAmount(10.5)).toBe("10.50");
  });
});

describe("fetchJson", () => {
  it("retries 5xx then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ err: true }, { status: 503 }))
      .mockResolvedValueOnce(Response.json({ ok: true }));

    const { data } = await fetchJson<{ ok: boolean }>("https://example.test", {
      gateway: "khalti",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      retries: 1,
      retryDelayMs: 1,
    });

    expect(data.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("throws GatewayApiError on 401 without retrying forever", async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({ detail: "Invalid token." }, { status: 401 }),
    );

    await expect(
      fetchJson("https://example.test", {
        gateway: "khalti",
        fetchImpl: fetchImpl as unknown as typeof fetch,
        retries: 2,
      }),
    ).rejects.toBeInstanceOf(GatewayApiError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe("PaymentService + registry", () => {
  it("start() persists a pending payment then handleReturn confirms once", async () => {
    const store = new MemoryPaymentStore();
    const gateway: PaymentGateway = {
      name: "khalti",
      initiate: async () => ({
        redirectUrl: "https://pay.test",
        providerRef: "pidx-svc",
        method: "GET",
      }),
      handleCallback: async () => ({
        kind: "callback_received",
        providerRef: "pidx-svc",
        raw: { pidx: "pidx-svc" },
      }),
      verify: async () => ({
        status: "confirmed",
        providerRef: "pidx-svc",
        amount: 20,
        raw: {},
      }),
      refund: async () => ({ status: "unsupported", providerRef: "pidx-svc" }),
    };

    const onConfirmed = vi.fn();
    const service = createPaymentService(gateway, store, {
      successUrl: "https://ok",
      failureUrl: "https://fail",
      onConfirmed,
    });

    const { record, initiate } = await service.start({
      amount: 20,
      orderId: "o1",
      orderName: "Item",
      returnUrl: "https://return",
      websiteUrl: "https://site",
    });

    expect(record.status).toBe("pending");
    expect(initiate.providerRef).toBe("pidx-svc");

    const result = await service.handleReturn({ pidx: "pidx-svc" });
    expect(result.status).toBe("confirmed");
    expect(onConfirmed).toHaveBeenCalledTimes(1);
  });

  it("registerGateway adds a pluggable name", () => {
    registerGateway("demo-pay", () => ({
      name: "demo-pay",
      initiate: async () => ({
        redirectUrl: "https://x",
        providerRef: "r",
        method: "GET",
      }),
      handleCallback: async () => ({
        kind: "callback_cancelled",
        reason: "n/a",
        raw: {},
      }),
      verify: async () => ({
        status: "failed",
        providerRef: "r",
        raw: {},
      }),
      refund: async () => ({ status: "unsupported", providerRef: "r" }),
    }));

    expect(listRegisteredGateways()).toContain("demo-pay");
  });
});
