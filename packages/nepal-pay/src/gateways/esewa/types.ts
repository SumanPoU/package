export const ESEWA_FORM_URL = {
  sandbox: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  production: "https://epay.esewa.com.np/api/epay/main/v2/form",
} as const;

export const ESEWA_STATUS_URL = {
  sandbox: "https://rc.esewa.com.np/api/epay/transaction/status/",
  production: "https://esewa.com.np/api/epay/transaction/status/",
} as const;

/** Documented eSewa transaction status values. */
export type EsewaTransactionStatus =
  | "COMPLETE"
  | "PENDING"
  | "FULL_REFUND"
  | "PARTIAL_REFUND"
  | "AMBIGUOUS"
  | "NOT_FOUND"
  | "CANCELED";

export interface EsewaCallbackPayload {
  transaction_code: string;
  status: string;
  total_amount: number | string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
  [key: string]: string | number;
}

export interface EsewaStatusResponse {
  product_code?: string;
  transaction_uuid?: string;
  total_amount?: number | string;
  status?: EsewaTransactionStatus | string;
  ref_id?: string;
  [key: string]: unknown;
}
