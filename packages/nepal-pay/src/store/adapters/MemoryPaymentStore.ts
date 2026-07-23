import { randomUUID } from "node:crypto";
import { PaymentStateMachine } from "../../core/PaymentStateMachine";
import type {
  GatewayName,
  PaymentRecord,
  PaymentStatus,
} from "../../core/types";
import type {
  CreatePaymentInput,
  PaymentStore,
  UpdateStatusResult,
} from "../PaymentStore";

/**
 * In-memory store for development and tests.
 * Enforces unique `(gateway, providerRef)` and idempotent confirm.
 */
export class MemoryPaymentStore implements PaymentStore {
  private readonly byId = new Map<string, PaymentRecord>();
  private readonly byProviderKey = new Map<string, string>();
  /** Serialize updates per payment id to make concurrent confirms safe. */
  private readonly locks = new Map<string, Promise<unknown>>();

  private providerKey(gateway: GatewayName, providerRef: string): string {
    return `${gateway}::${providerRef}`;
  }

  private async withLock<T>(id: string, fn: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(id) ?? Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const chained = previous.then(() => gate);
    this.locks.set(id, chained);

    await previous.catch(() => undefined);
    try {
      return await fn();
    } finally {
      release();
      if (this.locks.get(id) === chained) {
        this.locks.delete(id);
      }
    }
  }

  async create(input: CreatePaymentInput): Promise<PaymentRecord> {
    const key = this.providerKey(input.gateway, input.providerRef);
    if (this.byProviderKey.has(key)) {
      throw new Error(
        `Duplicate payment for (${input.gateway}, ${input.providerRef})`,
      );
    }

    const now = new Date();
    const record: PaymentRecord = {
      id: randomUUID(),
      gateway: input.gateway,
      providerRef: input.providerRef,
      orderId: input.orderId,
      amount: input.amount,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      metadata: input.metadata,
    };

    this.byId.set(record.id, record);
    this.byProviderKey.set(key, record.id);
    return { ...record };
  }

  async get(id: string): Promise<PaymentRecord | null> {
    const record = this.byId.get(id);
    return record ? { ...record } : null;
  }

  async findByProviderRef(
    gateway: GatewayName,
    providerRef: string,
  ): Promise<PaymentRecord | null> {
    const id = this.byProviderKey.get(this.providerKey(gateway, providerRef));
    if (!id) {
      return null;
    }
    return this.get(id);
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<UpdateStatusResult> {
    return this.withLock(id, async () => {
      const existing = this.byId.get(id);
      if (!existing) {
        throw new Error(`Payment not found: ${id}`);
      }

      // Idempotent confirm: already confirmed → return as-is.
      if (existing.status === "confirmed" && status === "confirmed") {
        return { record: { ...existing }, changed: false };
      }

      // Already confirmed with a non-refund target — no-op return.
      if (existing.status === "confirmed" && status !== "refunded") {
        return { record: { ...existing }, changed: false };
      }

      PaymentStateMachine.assertTransition(existing.status, status);

      const updated: PaymentRecord = {
        ...existing,
        status,
        updatedAt: new Date(),
      };
      this.byId.set(id, updated);
      return { record: { ...updated }, changed: true };
    });
  }
}
