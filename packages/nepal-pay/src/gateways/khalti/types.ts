export const KHALTI_BASE_URL = {
  sandbox: "https://dev.khalti.com/api/v2/",
  production: "https://khalti.com/api/v2/",
} as const;

/** Documented Khalti lookup / callback status values. */
export type KhaltiPaymentStatus =
  | "Completed"
  | "Pending"
  | "Initiated"
  | "Refunded"
  | "Expired"
  | "User canceled"
  | "Partially refunded";

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at?: string;
  expires_in?: number;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: KhaltiPaymentStatus | string;
  transaction_id?: string;
  fee?: number;
  refunded?: boolean;
  [key: string]: unknown;
}

export interface KhaltiCustomerInfo {
  name?: string;
  email?: string;
  phone?: string;
}
