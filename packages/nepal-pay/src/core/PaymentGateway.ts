import type {
  CallbackResult,
  GatewayName,
  InitiateResult,
  PaymentRequest,
  RefundResult,
  VerificationResult,
} from "./types";

/**
 * Every gateway adapter implements this interface.
 *
 * `handleCallback` MUST NEVER confirm payment — its return type has no
 * `confirmed` variant. Only `verify()` may produce a confirmed result.
 */
export interface PaymentGateway {
  readonly name: GatewayName;

  initiate(req: PaymentRequest): Promise<InitiateResult>;

  /**
   * Parses return-URL query params into a normalized, untrusted shape.
   * Return type excludes any path to `confirmed`.
   */
  handleCallback(query: Record<string, string>): Promise<CallbackResult>;

  /**
   * The ONLY method whose result may drive a transition to `confirmed`.
   * eSewa: recompute signature (if callback data provided via store) + status API.
   * Khalti: POST /epayment/lookup/.
   */
  verify(
    providerRef: string,
    context?: VerifyContext,
  ): Promise<VerificationResult>;

  refund(providerRef: string, amount?: number): Promise<RefundResult>;
}

/** Optional context for eSewa verify (amount + callback fields for signature). */
export interface VerifyContext {
  /** NPR amount associated with the payment (needed for eSewa status check). */
  amount?: number;
  /** Decoded eSewa callback payload fields, when available. */
  callbackPayload?: Record<string, string | number>;
}
