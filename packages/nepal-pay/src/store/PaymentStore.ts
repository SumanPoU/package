import type { GatewayName, PaymentRecord, PaymentStatus } from "../core/types";

export interface CreatePaymentInput {
  gateway: GatewayName;
  providerRef: string;
  orderId: string;
  amount: number;
  metadata?: Record<string, string>;
}

export interface UpdateStatusResult {
  record: PaymentRecord;
  /** False when the write was an idempotent no-op (e.g. already confirmed). */
  changed: boolean;
}

export interface PaymentStore {
  create(input: CreatePaymentInput): Promise<PaymentRecord>;
  get(id: string): Promise<PaymentRecord | null>;
  findByProviderRef(
    gateway: GatewayName,
    providerRef: string,
  ): Promise<PaymentRecord | null>;
  /**
   * Update status. Implementations MUST:
   * - Enforce unique `(gateway, providerRef)`
   * - Treat confirmed → confirmed as an idempotent no-op (`changed: false`)
   */
  updateStatus(id: string, status: PaymentStatus): Promise<UpdateStatusResult>;
}
