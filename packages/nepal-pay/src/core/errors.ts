export class NepalPayError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "NepalPayError";
    this.code = code;
  }
}

/** Missing / invalid constructor options. */
export class ConfigError extends NepalPayError {
  constructor(message: string) {
    super("CONFIG", message);
    this.name = "ConfigError";
  }
}

/** eSewa callback signature did not match recomputed HMAC. */
export class SignatureMismatchError extends NepalPayError {
  readonly expected?: string;
  readonly received?: string;

  constructor(
    message = "eSewa callback signature mismatch — possible tampering",
  ) {
    super("SIGNATURE_MISMATCH", message);
    this.name = "SignatureMismatchError";
  }
}

/** Server-side verify() did not confirm payment. */
export class VerificationFailedError extends NepalPayError {
  readonly providerRef: string;
  readonly gatewayStatus?: string;

  constructor(providerRef: string, message: string, gatewayStatus?: string) {
    super("VERIFICATION_FAILED", message);
    this.name = "VerificationFailedError";
    this.providerRef = providerRef;
    this.gatewayStatus = gatewayStatus;
  }
}

/** Upstream gateway HTTP / API error. */
export class GatewayApiError extends NepalPayError {
  readonly gateway: string;
  readonly statusCode?: number;
  readonly body?: unknown;

  constructor(
    gateway: string,
    message: string,
    statusCode?: number,
    body?: unknown,
  ) {
    super("GATEWAY_API", message);
    this.name = "GatewayApiError";
    this.gateway = gateway;
    this.statusCode = statusCode;
    this.body = body;
  }
}

/** Illegal payment status transition. */
export class InvalidTransitionError extends NepalPayError {
  readonly from: string;
  readonly to: string;

  constructor(from: string, to: string) {
    super(
      "INVALID_TRANSITION",
      `Cannot transition payment from "${from}" to "${to}"`,
    );
    this.name = "InvalidTransitionError";
    this.from = from;
    this.to = to;
  }
}

/** Refund not available through this SDK path. */
export class RefundNotSupportedError extends NepalPayError {
  readonly gateway: string;

  constructor(gateway: string) {
    super(
      "REFUND_NOT_SUPPORTED",
      `Refund API is not integrated for "${gateway}" in v1 — use the gateway merchant dashboard`,
    );
    this.name = "RefundNotSupportedError";
    this.gateway = gateway;
  }
}
