import type { PaymentGateway } from "../core/PaymentGateway";
import type {
  InitiateResult,
  PaymentRecord,
  PaymentRequest,
} from "../core/types";
import type { PaymentStore } from "../store/PaymentStore";
import {
  createReturnUrlHandler,
  type ReturnUrlHandlerOptions,
  type ReturnUrlHandlerResult,
} from "../webhook/handlers";

export interface PaymentServiceOptions extends ReturnUrlHandlerOptions {}

export interface StartPaymentResult {
  record: PaymentRecord;
  initiate: InitiateResult;
}

/**
 * High-level orchestrator: initiate → persist → handle return URL.
 * Prefer this over wiring gateway + store by hand in app code.
 */
export class PaymentService {
  private readonly handleReturnFn: (
    query: Record<string, string>,
  ) => Promise<ReturnUrlHandlerResult>;

  constructor(
    private readonly gateway: PaymentGateway,
    private readonly store: PaymentStore,
    options: PaymentServiceOptions,
  ) {
    this.handleReturnFn = createReturnUrlHandler(gateway, store, options);
  }

  /**
   * Call gateway.initiate, then create a pending store row keyed by providerRef.
   */
  async start(req: PaymentRequest): Promise<StartPaymentResult> {
    const initiate = await this.gateway.initiate(req);
    const record = await this.store.create({
      gateway: this.gateway.name,
      providerRef: initiate.providerRef,
      orderId: req.orderId,
      amount: req.amount,
      metadata: req.metadata,
    });
    return { record, initiate };
  }

  /** Framework-agnostic return-URL entrypoint. */
  handleReturn(query: Record<string, string>): Promise<ReturnUrlHandlerResult> {
    return this.handleReturnFn(query);
  }

  getGateway(): PaymentGateway {
    return this.gateway;
  }

  getStore(): PaymentStore {
    return this.store;
  }
}

export function createPaymentService(
  gateway: PaymentGateway,
  store: PaymentStore,
  options: PaymentServiceOptions,
): PaymentService {
  return new PaymentService(gateway, store, options);
}
