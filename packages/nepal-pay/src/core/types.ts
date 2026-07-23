/** Built-in gateways. Additional names can be registered via `registerGateway`. */
export type BuiltInGatewayName = "esewa" | "khalti";

/**
 * Gateway identifier. Built-ins are typed; custom plugins use any string
 * (e.g. `"fonepay"`) after `registerGateway("fonepay", factory)`.
 */
export type GatewayName = BuiltInGatewayName | (string & {});

/**
 * Payment lifecycle states.
 *
 * `confirmed` is reachable only via `verify()` — never via `handleCallback()`.
 */
export type PaymentStatus =
  | "pending"
  | "callback_received"
  | "verifying"
  | "confirmed"
  | "failed"
  | "refunded";

/** Sandbox vs production mode. Consumer supplies credentials; no env-var magic. */
export type PaymentMode = "sandbox" | "production";

/**
 * Shared payment request. Amount is always NPR as a decimal at the public API
 * boundary (e.g. `10.50`). Khalti paisa conversion happens inside the adapter.
 */
export interface PaymentRequest {
  /** Amount in NPR (decimal). Must be > 10 for Khalti (API minimum). */
  amount: number;
  /** Unique merchant-side order / invoice id. */
  orderId: string;
  /** Human-readable order name (required by Khalti; used as product label for eSewa). */
  orderName: string;
  /** Absolute URL the gateway redirects to after payment attempt. */
  returnUrl: string;
  /** Absolute URL shown / linked as the merchant website (Khalti required). */
  websiteUrl: string;
  /** Absolute URL for failure / cancel redirects when the gateway supports it. */
  failureUrl?: string;
  taxAmount?: number;
  serviceCharge?: number;
  deliveryCharge?: number;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  /** Opaque merchant metadata echoed by gateways that support it. */
  metadata?: Record<string, string>;
}

export interface InitiateResult {
  /** URL to send the user to (Khalti payment_url, or eSewa form action). */
  redirectUrl: string;
  /** transaction_uuid (eSewa) or pidx (Khalti). */
  providerRef: string;
  /**
   * eSewa uses an HTML form POST. When `method` is `"POST"`, render an
   * auto-submit form with `formFields` to `redirectUrl`. Khalti is `"GET"`.
   */
  method: "GET" | "POST";
  formFields?: Record<string, string>;
}

/**
 * Normalized callback parse result.
 *
 * Intentionally has NO `confirmed` variant — TypeScript makes it impossible
 * to treat a callback as proof of payment.
 */
export type CallbackResult =
  | {
      kind: "callback_received";
      providerRef: string;
      raw: Record<string, string>;
    }
  | {
      kind: "callback_cancelled";
      providerRef?: string;
      reason: string;
      raw: Record<string, string>;
    };

export type VerificationStatus =
  | "confirmed"
  | "pending"
  | "failed"
  | "refunded"
  | "partially_refunded";

export interface VerificationResult {
  status: VerificationStatus;
  providerRef: string;
  /** Amount in NPR (normalized). */
  amount?: number;
  transactionId?: string;
  raw: unknown;
}

export interface RefundResult {
  status: "refunded" | "partially_refunded" | "failed" | "unsupported";
  providerRef: string;
  amount?: number;
  raw?: unknown;
  message?: string;
}

export interface PaymentRecord {
  id: string;
  gateway: GatewayName;
  providerRef: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, string>;
}

export interface EsewaConfig {
  productCode: string;
  secretKey: string;
}

export interface KhaltiConfig {
  secretKey: string;
}

export interface NepalPayConfig {
  mode: PaymentMode;
  esewa?: EsewaConfig;
  khalti?: KhaltiConfig;
}
