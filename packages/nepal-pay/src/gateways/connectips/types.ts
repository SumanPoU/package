import type { PaymentMode } from "../../core/types";

/** Official hosts — override via `ConnectIpsConfig.baseUrl` if NCHL gives a different host. */
export const CONNECTIPS_BASE_URL: Record<PaymentMode, string> = {
  sandbox: "https://uat.connectips.com",
  production: "https://login.connectips.com",
};

export function connectIpsLoginUrl(baseUrl: string): string {
  return `${trimSlash(baseUrl)}/connectipswebgw/loginpage`;
}

export function connectIpsValidateUrl(baseUrl: string): string {
  return `${trimSlash(baseUrl)}/connectipswebws/api/creditor/validatetxn`;
}

export function connectIpsTxnDetailUrl(baseUrl: string): string {
  return `${trimSlash(baseUrl)}/connectipswebws/api/creditor/gettxndetail`;
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** NCHL validatetxn / gettxndetail `status` field. */
export type ConnectIpsTxnStatus = "SUCCESS" | "FAILED" | "ERROR";

export interface ConnectIpsValidateRequest {
  merchantId: number;
  appId: string;
  referenceId: string;
  txnAmt: number;
  token: string;
}

export interface ConnectIpsValidateResponse {
  merchantId?: number;
  appId?: string;
  referenceId?: string;
  txnAmt?: string | number;
  token?: string | null;
  status?: ConnectIpsTxnStatus | string;
  statusDesc?: string;
}

export interface ConnectIpsTxnDetailResponse
  extends ConnectIpsValidateResponse {
  debitBankCode?: string;
  txnId?: number | string;
  batchId?: number | string;
  txnDate?: number | string;
  txnCrncy?: string | null;
  chargeAmt?: number;
  chargeLiability?: string;
  refId?: string;
  remarks?: string;
  particulars?: string;
  /** 000, 999, DEFER = success at merchant credit side. */
  creditStatus?: string;
}

/** Field length caps from connectIPS §3.2. */
export const CONNECTIPS_LIMITS = {
  merchantId: 20,
  appId: 20,
  appName: 30,
  txnId: 20,
  txnDate: 10,
  txnCrncy: 3,
  txnAmt: 20,
  referenceId: 20,
  remarks: 50,
  particulars: 100,
} as const;
