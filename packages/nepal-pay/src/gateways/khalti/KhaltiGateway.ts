import {
  assertKhaltiMinAmount,
  nprToPaisa,
  paisaToNpr,
} from "../../core/amount";
import {
  ConfigError,
  GatewayApiError,
  RefundNotSupportedError,
} from "../../core/errors";
import type { PaymentGateway, VerifyContext } from "../../core/PaymentGateway";
import type {
  CallbackResult,
  InitiateResult,
  KhaltiConfig,
  PaymentMode,
  PaymentRequest,
  RefundResult,
  VerificationResult,
  VerificationStatus,
} from "../../core/types";
import { fetchJson } from "../../http/fetchJson";
import {
  KHALTI_BASE_URL,
  type KhaltiInitiateResponse,
  type KhaltiLookupResponse,
  type KhaltiPaymentStatus,
} from "./types";

export { nprToPaisa, paisaToNpr } from "../../core/amount";

function mapKhaltiStatus(status: string | undefined): VerificationStatus {
  switch (status) {
    case "Completed":
      return "confirmed";
    case "Pending":
    case "Initiated":
      return "pending";
    case "Refunded":
      return "refunded";
    case "Partially refunded":
      return "partially_refunded";
    default:
      return "failed";
  }
}

export interface KhaltiGatewayOptions {
  mode: PaymentMode;
  config: KhaltiConfig;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retries?: number;
}

export class KhaltiGateway implements PaymentGateway {
  readonly name = "khalti" as const;
  private readonly mode: PaymentMode;
  private readonly config: KhaltiConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly timeoutMs?: number;
  private readonly retries?: number;

  constructor(options: KhaltiGatewayOptions) {
    if (!options.config.secretKey?.trim()) {
      throw new ConfigError("khalti.secretKey is required");
    }
    this.mode = options.mode;
    this.config = options.config;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = KHALTI_BASE_URL[this.mode];
    this.timeoutMs = options.timeoutMs;
    this.retries = options.retries;
  }

  private authHeaders(): HeadersInit {
    return {
      Authorization: `Key ${this.config.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async initiate(req: PaymentRequest): Promise<InitiateResult> {
    if (!req.returnUrl) {
      throw new ConfigError("returnUrl is required");
    }
    if (!req.websiteUrl) {
      throw new ConfigError("websiteUrl is required for Khalti");
    }
    if (!req.orderId) {
      throw new ConfigError("orderId is required");
    }
    if (!req.orderName) {
      throw new ConfigError("orderName is required");
    }

    assertKhaltiMinAmount(req.amount);
    const amountPaisa = nprToPaisa(req.amount);

    const body: Record<string, unknown> = {
      return_url: req.returnUrl,
      website_url: req.websiteUrl,
      amount: amountPaisa,
      purchase_order_id: req.orderId,
      purchase_order_name: req.orderName,
    };

    if (req.customer) {
      body.customer_info = {
        name: req.customer.name,
        email: req.customer.email,
        phone: req.customer.phone,
      };
    }

    if (req.metadata) {
      for (const [key, value] of Object.entries(req.metadata)) {
        if (key.startsWith("merchant_")) {
          body[key] = value;
        }
      }
    }

    const { data } = await fetchJson<KhaltiInitiateResponse>(
      new URL("epayment/initiate/", this.baseUrl).toString(),
      {
        method: "POST",
        headers: this.authHeaders(),
        body: JSON.stringify(body),
        gateway: "khalti",
        fetchImpl: this.fetchImpl,
        timeoutMs: this.timeoutMs,
        retries: this.retries ?? 1,
      },
    );

    if (!data.pidx || !data.payment_url) {
      throw new GatewayApiError(
        "khalti",
        "Initiate response missing pidx or payment_url",
        undefined,
        data,
      );
    }

    return {
      redirectUrl: data.payment_url,
      providerRef: data.pidx,
      method: "GET",
    };
  }

  async handleCallback(query: Record<string, string>): Promise<CallbackResult> {
    const status = query.status ?? "";
    const providerRef = query.pidx || undefined;
    const raw = { ...query };

    if (
      status === "User canceled" ||
      status === "User cancelled" ||
      status.toLowerCase() === "canceled" ||
      status.toLowerCase() === "cancelled"
    ) {
      return {
        kind: "callback_cancelled",
        providerRef,
        reason: `Khalti status: ${status}`,
        raw,
      };
    }

    if (!providerRef) {
      return {
        kind: "callback_cancelled",
        reason: "Missing pidx in Khalti callback",
        raw,
      };
    }

    return {
      kind: "callback_received",
      providerRef,
      raw,
    };
  }

  async verify(
    providerRef: string,
    _context?: VerifyContext,
  ): Promise<VerificationResult> {
    void _context;

    const { data } = await fetchJson<KhaltiLookupResponse>(
      new URL("epayment/lookup/", this.baseUrl).toString(),
      {
        method: "POST",
        headers: this.authHeaders(),
        body: JSON.stringify({ pidx: providerRef }),
        gateway: "khalti",
        fetchImpl: this.fetchImpl,
        timeoutMs: this.timeoutMs,
        retries: this.retries ?? 1,
      },
    );

    const mapped = mapKhaltiStatus(String(data.status));

    return {
      status: mapped,
      providerRef,
      amount:
        typeof data.total_amount === "number"
          ? paisaToNpr(data.total_amount)
          : undefined,
      transactionId:
        typeof data.transaction_id === "string"
          ? data.transaction_id
          : undefined,
      raw: data,
    };
  }

  async refund(_providerRef: string, _amount?: number): Promise<RefundResult> {
    void _providerRef;
    void _amount;
    throw new RefundNotSupportedError("khalti");
  }
}

/** Exported for tests — maps every documented Khalti status. */
export function mapKhaltiStatusForTest(
  status: KhaltiPaymentStatus | string,
): VerificationStatus {
  return mapKhaltiStatus(status);
}
