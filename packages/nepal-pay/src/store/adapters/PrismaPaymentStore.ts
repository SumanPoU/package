/**
 * Reference Prisma / Postgres adapter — copy into your app; not a runtime dependency.
 *
 * Prisma schema sketch:
 *
 * ```
 * model Payment {
 *   id          String   @id @default(cuid())
 *   gateway     String
 *   providerRef String
 *   orderId     String
 *   amount      Float
 *   status      String
 *   metadata    Json?
 *   createdAt   DateTime @default(now())
 *   updatedAt   DateTime @updatedAt
 *
 *   @@unique([gateway, providerRef])
 *   @@index([orderId])
 * }
 * ```
 */

import { PaymentStateMachine } from "../../core/PaymentStateMachine";
import type { PaymentRecord, PaymentStatus } from "../../core/types";
import type {
  CreatePaymentInput,
  PaymentStore,
  UpdateStatusResult,
} from "../PaymentStore";

/** Minimal Prisma client surface used by the adapter. */
export interface PrismaPaymentDelegate {
  create(args: {
    data: {
      gateway: string;
      providerRef: string;
      orderId: string;
      amount: number;
      status: string;
      metadata?: unknown;
    };
  }): Promise<PrismaPaymentRow>;
  findUnique(args: {
    where:
      | { id: string }
      | { gateway_providerRef: { gateway: string; providerRef: string } };
  }): Promise<PrismaPaymentRow | null>;
  update(args: {
    where: { id: string };
    data: { status: string };
  }): Promise<PrismaPaymentRow>;
  $transaction?<T>(
    fn: (tx: { payment: PrismaPaymentDelegate }) => Promise<T>,
  ): Promise<T>;
}

export interface PrismaPaymentRow {
  id: string;
  gateway: string;
  providerRef: string;
  orderId: string;
  amount: number;
  status: string;
  metadata?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaClientLike {
  payment: PrismaPaymentDelegate;
  $transaction<T>(
    fn: (tx: { payment: PrismaPaymentDelegate }) => Promise<T>,
  ): Promise<T>;
}

function toRecord(row: PrismaPaymentRow): PaymentRecord {
  return {
    id: row.id,
    gateway: row.gateway,
    providerRef: row.providerRef,
    orderId: row.orderId,
    amount: row.amount,
    status: row.status as PaymentStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, string>)
        : undefined,
  };
}

/**
 * Production-oriented store. Uses a unique `(gateway, providerRef)` constraint
 * and transactional updates so concurrent confirms stay idempotent.
 */
export class PrismaPaymentStore implements PaymentStore {
  constructor(private readonly prisma: PrismaClientLike) {}

  async create(input: CreatePaymentInput): Promise<PaymentRecord> {
    const row = await this.prisma.payment.create({
      data: {
        gateway: input.gateway,
        providerRef: input.providerRef,
        orderId: input.orderId,
        amount: input.amount,
        status: "pending",
        metadata: input.metadata,
      },
    });
    return toRecord(row);
  }

  async get(id: string): Promise<PaymentRecord | null> {
    const row = await this.prisma.payment.findUnique({ where: { id } });
    return row ? toRecord(row) : null;
  }

  async findByProviderRef(
    gateway: string,
    providerRef: string,
  ): Promise<PaymentRecord | null> {
    const row = await this.prisma.payment.findUnique({
      where: { gateway_providerRef: { gateway, providerRef } },
    });
    return row ? toRecord(row) : null;
  }

  async updateStatus(
    id: string,
    status: PaymentStatus,
  ): Promise<UpdateStatusResult> {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.payment.findUnique({ where: { id } });
      if (!existing) {
        throw new Error(`Payment not found: ${id}`);
      }

      if (existing.status === "confirmed" && status === "confirmed") {
        return { record: toRecord(existing), changed: false };
      }
      if (existing.status === "confirmed" && status !== "refunded") {
        return { record: toRecord(existing), changed: false };
      }

      PaymentStateMachine.assertTransition(
        existing.status as PaymentStatus,
        status,
      );

      const updated = await tx.payment.update({
        where: { id },
        data: { status },
      });
      return { record: toRecord(updated), changed: true };
    });
  }
}
