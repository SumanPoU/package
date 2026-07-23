import { assertPositiveNpr, formatNprAmount } from "../../core/amount";
import {
  ConfigError,
  RefundNotSupportedError,
  SignatureMismatchError,
} from "../../core/errors";
import type { PaymentGateway, VerifyContext } from "../../core/PaymentGateway";
import type {
  CallbackResult,
  EsewaConfig,
  InitiateResult,
  PaymentMode,
  PaymentRequest,
  RefundResult,
  VerificationResult,
  VerificationStatus,
} from "../../core/types";
import { fetchJson } from "../../http/fetchJson";
import { signInitiatePayload, verifySignature } from "./signature";
import {
  ESEWA_FORM_URL,
  ESEWA_STATUS_URL,
  type EsewaCallbackPayload,
  type EsewaStatusResponse,
  type EsewaTransactionStatus,
} from "./types";

const UUID_PATTERN = /^[A-Za-z0-9-]+$/;

function generateTransactionUuid(orderId: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  const raw = `${orderId}-${stamp}-${rand}`.replace(/[^A-Za-z0-9-]/g, "-");
  if (!UUID_PATTERN.test(raw)) {
    return `txn-${stamp}-${rand}`;
  }
  return raw.slice(0, 100);
}

function mapEsewaStatus(status: string | undefined): VerificationStatus {
  switch (status) {
    case "COMPLETE":
      return "confirmed";
    case "PENDING":
    case "AMBIGUOUS":
      return "pending";
    case "FULL_REFUND":
      return "refunded";
    case "PARTIAL_REFUND":
      return "partially_refunded";
    default:
      return "failed";
  }
}

function decodeCallbackData(
  query: Record<string, string>,
): EsewaCallbackPayload | null {
  const encoded = query.data ?? query.payload;
  if (!encoded) {
    return null;
  }
  try {
    const json = Buffer.from(encoded, "base64").toString("utf8");
    return JSON.parse(json) as EsewaCallbackPayload;
  } catch {
    return null;
  }
}

export interface EsewaGatewayOptions {
  mode: PaymentMode;
  config: EsewaConfig;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retries?: number;
}

export class EsewaGateway implements PaymentGateway {
  readonly name = "esewa" as const;
  private readonly mode: PaymentMode;
  private readonly config: EsewaConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs?: number;
  private readonly retries?: number;

  constructor(options: EsewaGatewayOptions) {
    if (!options.config.productCode?.trim()) {
      throw new ConfigError("esewa.productCode is required");
    }
    if (!options.config.secretKey?.trim()) {
      throw new ConfigError("esewa.secretKey is required");
    }
    this.mode = options.mode;
    this.config = options.config;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs;
    this.retries = options.retries;
  }

  async initiate(req: PaymentRequest): Promise<InitiateResult> {
    assertPositiveNpr(req.amount);
    if (!req.returnUrl) {
      throw new ConfigError("returnUrl is required");
    }

    const tax = req.taxAmount ?? 0;
    const service = req.serviceCharge ?? 0;
    const delivery = req.deliveryCharge ?? 0;
    const total = req.amount + tax + service + delivery;

    const transactionUuid =
      req.metadata?.transaction_uuid &&
      UUID_PATTERN.test(req.metadata.transaction_uuid)
        ? req.metadata.transaction_uuid
        : generateTransactionUuid(req.orderId);

    const amountStr = formatNprAmount(req.amount);
    const taxStr = formatNprAmount(tax);
    const serviceStr = formatNprAmount(service);
    const deliveryStr = formatNprAmount(delivery);
    const totalStr = formatNprAmount(total);

    const { signature, signedFieldNames } = signInitiatePayload(
      totalStr,
      transactionUuid,
      this.config.productCode,
      this.config.secretKey,
    );

    const formFields: Record<string, string> = {
      amount: amountStr,
      tax_amount: taxStr,
      product_service_charge: serviceStr,
      product_delivery_charge: deliveryStr,
      total_amount: totalStr,
      transaction_uuid: transactionUuid,
      product_code: this.config.productCode,
      success_url: req.returnUrl,
      failure_url: req.failureUrl ?? req.returnUrl,
      signed_field_names: signedFieldNames,
      signature,
    };

    return {
      redirectUrl: ESEWA_FORM_URL[this.mode],
      providerRef: transactionUuid,
      method: "POST",
      formFields,
    };
  }

  async handleCallback(query: Record<string, string>): Promise<CallbackResult> {
    const payload = decodeCallbackData(query);

    const flat: Partial<EsewaCallbackPayload> = payload ?? {
      transaction_code: query.transaction_code,
      status: query.status,
      total_amount: query.total_amount,
      transaction_uuid: query.transaction_uuid,
      product_code: query.product_code,
      signed_field_names: query.signed_field_names,
      signature: query.signature,
    };

    const status = String(flat.status ?? "").toUpperCase();
    const providerRef = flat.transaction_uuid
      ? String(flat.transaction_uuid)
      : undefined;

    const raw: Record<string, string> = {};
    for (const [k, v] of Object.entries(query)) {
      raw[k] = v;
    }
    if (payload) {
      for (const [k, v] of Object.entries(payload)) {
        raw[k] = String(v);
      }
    }

    if (
      status === "CANCELED" ||
      status === "CANCELLED" ||
      (status === "PENDING" && query.cancelled === "true")
    ) {
      return {
        kind: "callback_cancelled",
        providerRef,
        reason: `eSewa status: ${status || "cancelled"}`,
        raw,
      };
    }

    if (!providerRef) {
      return {
        kind: "callback_cancelled",
        reason: "Missing transaction_uuid in eSewa callback",
        raw,
      };
    }

    if (flat.signature && flat.signed_field_names) {
      const fields: Record<string, string | number> = {
        transaction_code: flat.transaction_code ?? "",
        status: flat.status ?? "",
        total_amount: flat.total_amount ?? "",
        transaction_uuid: flat.transaction_uuid ?? "",
        product_code: flat.product_code ?? "",
        signed_field_names: flat.signed_field_names,
      };
      const ok = verifySignature(
        fields,
        String(flat.signed_field_names),
        String(flat.signature),
        this.config.secretKey,
      );
      if (!ok) {
        throw new SignatureMismatchError();
      }
    }

    return {
      kind: "callback_received",
      providerRef,
      raw,
    };
  }

  async verify(
    providerRef: string,
    context?: VerifyContext,
  ): Promise<VerificationResult> {
    if (context?.callbackPayload) {
      const p = context.callbackPayload;
      const signedFieldNames = String(p.signed_field_names ?? "");
      const signature = String(p.signature ?? "");
      if (signedFieldNames && signature) {
        const ok = verifySignature(
          p,
          signedFieldNames,
          signature,
          this.config.secretKey,
        );
        if (!ok) {
          throw new SignatureMismatchError();
        }
      }
    }

    const amount = context?.amount;
    if (amount === undefined) {
      throw new ConfigError(
        "eSewa verify() requires context.amount (NPR) for the status check API",
      );
    }

    const totalAmount = formatNprAmount(amount);
    const url = new URL(ESEWA_STATUS_URL[this.mode]);
    url.searchParams.set("product_code", this.config.productCode);
    url.searchParams.set("total_amount", totalAmount);
    url.searchParams.set("transaction_uuid", providerRef);

    const { data: body } = await fetchJson<EsewaStatusResponse>(
      url.toString(),
      {
        method: "GET",
        gateway: "esewa",
        fetchImpl: this.fetchImpl,
        timeoutMs: this.timeoutMs,
        retries: this.retries ?? 1,
      },
    );

    const gatewayStatus = String(body.status ?? "") as EsewaTransactionStatus;
    const mapped = mapEsewaStatus(gatewayStatus);

    return {
      status: mapped,
      providerRef,
      amount,
      transactionId: typeof body.ref_id === "string" ? body.ref_id : undefined,
      raw: body,
    };
  }

  async refund(_providerRef: string, _amount?: number): Promise<RefundResult> {
    void _providerRef;
    void _amount;
    throw new RefundNotSupportedError("esewa");
  }
}

/** Exported for tests — maps every documented eSewa status. */
export function mapEsewaStatusForTest(
  status: EsewaTransactionStatus | string,
): VerificationStatus {
  return mapEsewaStatus(status);
}
