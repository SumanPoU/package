import { describe, expect, it, vi } from "vitest";
import type { PaymentGateway } from "../src/core/PaymentGateway";
import type { CallbackResult, VerificationResult } from "../src/core/types";
import { MemoryPaymentStore } from "../src/store/adapters/MemoryPaymentStore";
import { createReturnUrlHandler } from "../src/webhook/handlers";

function mockGateway(overrides: Partial<PaymentGateway> = {}): PaymentGateway {
  return {
    name: "khalti",
    initiate: vi.fn(),
    handleCallback: vi.fn(
      async (): Promise<CallbackResult> => ({
        kind: "callback_received",
        providerRef: "pidx-dup",
        raw: { pidx: "pidx-dup", status: "Completed" },
      }),
    ),
    verify: vi.fn(
      async (): Promise<VerificationResult> => ({
        status: "confirmed",
        providerRef: "pidx-dup",
        amount: 20,
        raw: { status: "Completed" },
      }),
    ),
    refund: vi.fn(),
    ...overrides,
  };
}

describe("idempotency", () => {
  it("duplicate confirm via updateStatus is a no-op (changed: false)", async () => {
    const store = new MemoryPaymentStore();
    const record = await store.create({
      gateway: "khalti",
      providerRef: "pidx-1",
      orderId: "ord-1",
      amount: 20,
    });

    await store.updateStatus(record.id, "callback_received");
    await store.updateStatus(record.id, "verifying");
    const first = await store.updateStatus(record.id, "confirmed");
    expect(first.changed).toBe(true);
    expect(first.record.status).toBe("confirmed");

    const second = await store.updateStatus(record.id, "confirmed");
    expect(second.changed).toBe(false);
    expect(second.record.status).toBe("confirmed");
    expect(second.record.updatedAt.getTime()).toBe(
      first.record.updatedAt.getTime(),
    );
  });

  it("enforces unique (gateway, providerRef)", async () => {
    const store = new MemoryPaymentStore();
    await store.create({
      gateway: "esewa",
      providerRef: "uuid-1",
      orderId: "a",
      amount: 100,
    });
    await expect(
      store.create({
        gateway: "esewa",
        providerRef: "uuid-1",
        orderId: "b",
        amount: 100,
      }),
    ).rejects.toThrow(/Duplicate/);
  });

  it("concurrent confirm path invokes onConfirmed only once", async () => {
    const store = new MemoryPaymentStore();
    await store.create({
      gateway: "khalti",
      providerRef: "pidx-dup",
      orderId: "ord-dup",
      amount: 20,
    });

    const grantAccess = vi.fn(async () => {
      // simulate async side effect
      await new Promise((r) => setTimeout(r, 5));
    });

    const gateway = mockGateway();
    const handler = createReturnUrlHandler(gateway, store, {
      successUrl: "https://merchant.test/ok",
      failureUrl: "https://merchant.test/fail",
      onConfirmed: grantAccess,
    });

    const query = { pidx: "pidx-dup", status: "Completed" };

    const [a, b] = await Promise.all([handler(query), handler(query)]);

    expect(a.status).toBe("confirmed");
    expect(b.status).toBe("confirmed");
    expect(grantAccess).toHaveBeenCalledTimes(1);

    const final = await store.findByProviderRef("khalti", "pidx-dup");
    expect(final?.status).toBe("confirmed");
  });
});
