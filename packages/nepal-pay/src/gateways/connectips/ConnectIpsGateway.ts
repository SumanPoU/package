import type { KeyObject } from "node:crypto";
import { assertPositiveNpr, nprToPaisa, paisaToNpr } from "../../core/amount";
import { ConfigError, RefundNotSupportedError } from "../../core/errors";
import type { PaymentGateway, VerifyContext } from "../../core/PaymentGateway";
import type {
  CallbackResult,
  ConnectIpsConfig,
  InitiateResult,
  PaymentMode,
  PaymentRequest,
  RefundResult,
  VerificationResult,
  VerificationStatus,
} from "../../core/types";
import { fetchJson } from "../../http/fetchJson";
import {
  buildConnectIpsLoginMessage,
  buildConnectIpsValidateMessage,
  type ConnectIpsKeySource,
  loadConnectIpsPrivateKey,
  resolvePfxBuffer,
  signConnectIpsToken,
} from "./signature";
import {
  CONNECTIPS_BASE_URL,
  CONNECTIPS_LIMITS,
  type ConnectIpsTxnDetailResponse,
  type ConnectIpsValidateRequest,
  type ConnectIpsValidateResponse,
  connectIpsLoginUrl,
  connectIpsTxnDetailUrl,
  connectIpsValidateUrl,
} from "./types";

function truncate(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

/** DD-MM-YYYY as required by connectIPS §3.2. */
export function formatConnectIpsTxnDate(date: Date = new Date()): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

/** Unique TXNID ≤ 20 chars (alphanumeric preferred). */
export function generateConnectIpsTxnId(orderId: string): string {
  const stamp = Date.now().toString(36);
  const cleaned = orderId.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  const raw = `${cleaned}${stamp}`.replace(/[^A-Za-z0-9]/g, "");
  return (raw || stamp).slice(0, CONNECTIPS_LIMITS.txnId);
}

function mapConnectIpsStatus(status: string | undefined): VerificationStatus {
  switch (String(status ?? "").toUpperCase()) {
    case "SUCCESS":
      return "confirmed";
    case "FAILED":
      return "failed";
    case "ERROR":
      // Doc: ERROR when txn not found / incomplete — treat as pending so
      // merchants can re-poll before marking failed.
      return "pending";
    default:
      return "failed";
  }
}

function resolveKeySource(config: ConnectIpsConfig): ConnectIpsKeySource {
  if (config.privateKeyPem?.trim()) {
    return { kind: "pem", pem: config.privateKeyPem };
  }
  if (config.pfx != null) {
    if (config.pfxPassword == null) {
      throw new ConfigError(
        "connectips.pfxPassword is required when using connectips.pfx",
      );
    }
    return {
      kind: "pfx",
      pfx: resolvePfxBuffer(config.pfx),
      passphrase: config.pfxPassword,
    };
  }
  throw new ConfigError(
    "connectips requires privateKeyPem or pfx (+ pfxPassword)",
  );
}

export interface ConnectIpsGatewayOptions {
  mode: PaymentMode;
  config: ConnectIpsConfig;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  retries?: number;
}

export class ConnectIpsGateway implements PaymentGateway {
  readonly name = "connectips" as const;
  private readonly mode: PaymentMode;
  private readonly config: ConnectIpsConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly privateKey: KeyObject;
  private readonly merchantId: number;
  private readonly timeoutMs?: number;
  private readonly retries?: number;

  constructor(options: ConnectIpsGatewayOptions) {
    const c = options.config;
    if (c.merchantId == null || String(c.merchantId).trim() === "") {
      throw new ConfigError("connectips.merchantId is required");
    }
    if (!c.appId?.trim()) {
      throw new ConfigError("connectips.appId is required");
    }
    if (!c.appName?.trim()) {
      throw new ConfigError("connectips.appName is required");
    }
    if (!c.password?.trim()) {
      throw new ConfigError("connectips.password is required (Basic Auth)");
    }

    this.mode = options.mode;
    this.config = c;
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.baseUrl = (
      c.baseUrl?.trim() || CONNECTIPS_BASE_URL[this.mode]
    ).replace(/\/+$/, "");
    this.privateKey = loadConnectIpsPrivateKey(resolveKeySource(c));
    this.merchantId = Number(c.merchantId);
    if (!Number.isFinite(this.merchantId)) {
      throw new ConfigError("connectips.merchantId must be numeric");
    }
    this.timeoutMs = options.timeoutMs;
    this.retries = options.retries;
  }

  private basicAuthHeader(): string {
    const token = Buffer.from(
      `${this.config.appId}:${this.config.password}`,
      "utf8",
    ).toString("base64");
    return `Basic ${token}`;
  }

  async initiate(req: PaymentRequest): Promise<InitiateResult> {
    assertPositiveNpr(req.amount);
    if (!req.orderId?.trim()) {
      throw new ConfigError("orderId is required");
    }

    const txnAmt = nprToPaisa(req.amount);
    const txnId =
      req.metadata?.txn_id &&
      req.metadata.txn_id.length <= CONNECTIPS_LIMITS.txnId
        ? req.metadata.txn_id
        : generateConnectIpsTxnId(req.orderId);

    const txnDate =
      req.metadata?.txn_date &&
      /^\d{2}-\d{2}-\d{4}$/.test(req.metadata.txn_date)
        ? req.metadata.txn_date
        : formatConnectIpsTxnDate();

    const referenceId = truncate(
      req.metadata?.reference_id ?? txnId,
      CONNECTIPS_LIMITS.referenceId,
    );
    const remarks = truncate(
      req.metadata?.remarks ?? req.orderName ?? req.orderId,
      CONNECTIPS_LIMITS.remarks,
    );
    const particulars = truncate(
      req.metadata?.particulars ?? req.orderName ?? req.orderId,
      CONNECTIPS_LIMITS.particulars,
    );
    const appName = truncate(this.config.appName, CONNECTIPS_LIMITS.appName);
    const txnCrncy = "NPR";

    const message = buildConnectIpsLoginMessage({
      merchantId: this.merchantId,
      appId: this.config.appId,
      appName,
      txnId,
      txnDate,
      txnCrncy,
      txnAmt,
      referenceId,
      remarks,
      particulars,
    });
    const token = signConnectIpsToken(message, this.privateKey);

    const formFields: Record<string, string> = {
      MERCHANTID: String(this.merchantId),
      APPID: this.config.appId,
      APPNAME: appName,
      TXNID: txnId,
      TXNDATE: txnDate,
      TXNCRNCY: txnCrncy,
      TXNAMT: String(txnAmt),
      REFERENCEID: referenceId,
      REMARKS: remarks,
      PARTICULARS: particulars,
      TOKEN: token,
    };

    return {
      redirectUrl: connectIpsLoginUrl(this.baseUrl),
      providerRef: txnId,
      method: "POST",
      formFields,
    };
  }

  async handleCallback(query: Record<string, string>): Promise<CallbackResult> {
    const raw = { ...query };
    const providerRef =
      query.TXNID || query.txnid || query.txnId || query.TXN_ID || undefined;

    const outcome = (
      query.outcome ??
      query.status ??
      query.connectips_outcome ??
      ""
    ).toLowerCase();

    if (
      outcome === "failure" ||
      outcome === "failed" ||
      outcome === "cancel" ||
      outcome === "cancelled" ||
      outcome === "canceled" ||
      query.cancelled === "true"
    ) {
      return {
        kind: "callback_cancelled",
        providerRef,
        reason: `connectIPS return marked failure/cancel (${outcome || "cancelled"})`,
        raw,
      };
    }

    if (!providerRef) {
      return {
        kind: "callback_cancelled",
        reason: "Missing TXNID in connectIPS callback",
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
    context?: VerifyContext,
  ): Promise<VerificationResult> {
    const amount = context?.amount;
    if (amount === undefined) {
      throw new ConfigError(
        "connectips verify() requires context.amount (NPR) for validatetxn",
      );
    }
    assertPositiveNpr(amount);
    const txnAmt = nprToPaisa(amount);

    const token = signConnectIpsToken(
      buildConnectIpsValidateMessage({
        merchantId: this.merchantId,
        appId: this.config.appId,
        referenceId: providerRef,
        txnAmt,
      }),
      this.privateKey,
    );

    const body: ConnectIpsValidateRequest = {
      merchantId: this.merchantId,
      appId: this.config.appId,
      referenceId: providerRef,
      txnAmt,
      token,
    };

    const { data } = await fetchJson<ConnectIpsValidateResponse>(
      connectIpsValidateUrl(this.baseUrl),
      {
        method: "POST",
        headers: {
          Authorization: this.basicAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        gateway: "connectips",
        fetchImpl: this.fetchImpl,
        timeoutMs: this.timeoutMs,
        retries: this.retries ?? 1,
      },
    );

    let detail: ConnectIpsTxnDetailResponse | undefined;
    if (String(data.status ?? "").toUpperCase() === "SUCCESS") {
      try {
        const detailRes = await fetchJson<ConnectIpsTxnDetailResponse>(
          connectIpsTxnDetailUrl(this.baseUrl),
          {
            method: "POST",
            headers: {
              Authorization: this.basicAuthHeader(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            gateway: "connectips",
            fetchImpl: this.fetchImpl,
            timeoutMs: this.timeoutMs,
            retries: this.retries ?? 1,
          },
        );
        detail = detailRes.data;
      } catch {
        // Detail is optional enrichment; validate status remains authoritative.
      }
    }

    const gatewayStatus = String(data.status ?? "");
    const mapped = mapConnectIpsStatus(gatewayStatus);
    const rawAmt = detail?.txnAmt ?? data.txnAmt;
    const amountNpr =
      typeof rawAmt === "number"
        ? paisaToNpr(rawAmt)
        : typeof rawAmt === "string" && rawAmt.trim() !== ""
          ? paisaToNpr(Number(rawAmt))
          : amount;

    return {
      status: mapped,
      providerRef,
      amount: Number.isFinite(amountNpr) ? amountNpr : amount,
      transactionId:
        detail?.txnId != null
          ? String(detail.txnId)
          : (detail?.refId ?? providerRef),
      raw: detail ? { validate: data, detail } : data,
    };
  }

  async refund(_providerRef: string, _amount?: number): Promise<RefundResult> {
    void _providerRef;
    void _amount;
    throw new RefundNotSupportedError("connectips");
  }
}

/** Exported for tests. */
export function mapConnectIpsStatusForTest(status: string): VerificationStatus {
  return mapConnectIpsStatus(status);
}
