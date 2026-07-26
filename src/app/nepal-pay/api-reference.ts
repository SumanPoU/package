export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const CONFIG_ROWS: PropRow[] = [
  {
    name: "mode",
    type: "'sandbox' | 'production'",
    description:
      "Selects gateway base URLs. No env-var magic inside the library.",
  },
  {
    name: "esewa.productCode",
    type: "string",
    description: "Merchant product code (UAT: EPAYTEST).",
  },
  {
    name: "esewa.secretKey",
    type: "string",
    description:
      "HMAC secret from eSewa. Consumer loads secrets; SDK does not.",
  },
  {
    name: "khalti.secretKey",
    type: "string",
    description: "Live/test secret. Sent as Authorization: Key <secret>.",
  },
  {
    name: "connectips.merchantId",
    type: "number | string",
    description: "NCHL merchant id (CREDITOR).",
  },
  {
    name: "connectips.appId",
    type: "string",
    description: "Application id — also Basic Auth username for validate APIs.",
  },
  {
    name: "connectips.appName",
    type: "string",
    description: "App display name (≤30 chars on login form).",
  },
  {
    name: "connectips.password",
    type: "string",
    description: "App password for Basic Auth on validatetxn / gettxndetail.",
  },
  {
    name: "connectips.pfx / pfxPassword",
    type: "Buffer | string / string",
    description:
      "PKCS#12 (CREDITOR.pfx) as Buffer or base64 + passphrase. Or use privateKeyPem.",
  },
  {
    name: "connectips.privateKeyPem",
    type: "string?",
    description: "PEM RSA private key alternative to pfx (handy for tests).",
  },
  {
    name: "connectips.baseUrl",
    type: "string?",
    description:
      "Override host (default UAT https://uat.connectips.com / prod https://login.connectips.com).",
  },
  {
    name: "timeoutMs",
    type: "number",
    default: "15000",
    description: "Abort gateway HTTP calls after this many ms.",
  },
  {
    name: "retries",
    type: "number",
    default: "1",
    description: "Extra attempts on network / 5xx / 429 (not on 4xx).",
  },
];

export const REQUEST_ROWS: PropRow[] = [
  {
    name: "amount",
    type: "number",
    description: "NPR decimal at the public API (e.g. 10.50). Never paisa.",
  },
  {
    name: "orderId",
    type: "string",
    description: "Unique merchant order / invoice id.",
  },
  {
    name: "orderName",
    type: "string",
    description: "Human label (required by Khalti).",
  },
  {
    name: "returnUrl",
    type: "string",
    description: "Absolute success / return URL.",
  },
  {
    name: "websiteUrl",
    type: "string",
    description: "Merchant site URL (required by Khalti).",
  },
  {
    name: "failureUrl",
    type: "string?",
    description: "eSewa failure redirect; defaults to returnUrl.",
  },
  {
    name: "taxAmount / serviceCharge / deliveryCharge",
    type: "number?",
    default: "0",
    description: "eSewa breakdown; total must equal amount + these.",
  },
  {
    name: "customer",
    type: "{ name?, email?, phone? }?",
    description: "Optional Khalti customer_info.",
  },
  {
    name: "metadata",
    type: "Record<string, string>?",
    description:
      "Opaque fields. merchant_* echoed by Khalti; transaction_uuid for eSewa; txn_id / txn_date / remarks / particulars for connectIPS.",
  },
];

export const GATEWAY_API: PropRow[] = [
  {
    name: "initiate",
    type: "(req) => Promise<InitiateResult>",
    description:
      "Start payment. Khalti → payment_url (GET). eSewa / connectIPS → form action + formFields (POST).",
  },
  {
    name: "handleCallback",
    type: "(query) => Promise<CallbackResult>",
    description:
      "Parse return-URL params. Return type has NO confirmed variant — untrusted.",
  },
  {
    name: "verify",
    type: "(providerRef, context?) => Promise<VerificationResult>",
    description:
      "ONLY path that may yield confirmed. eSewa: signature + status API. Khalti: lookup. connectIPS: validatetxn.",
  },
  {
    name: "refund",
    type: "(providerRef, amount?) => Promise<RefundResult>",
    description: "v1 throws RefundNotSupportedError — use gateway dashboards.",
  },
];

export const SERVICE_API: PropRow[] = [
  {
    name: "start",
    type: "(req) => Promise<{ record, initiate }>",
    description: "initiate() + store.create(pending) in one call.",
  },
  {
    name: "handleReturn",
    type: "(query) => Promise<ReturnUrlHandlerResult>",
    description:
      "callback → verifying → verify → idempotent confirm + optional onConfirmed.",
  },
];

export const STORE_API: PropRow[] = [
  {
    name: "create",
    type: "(input) => Promise<PaymentRecord>",
    description: "Must enforce unique (gateway, providerRef).",
  },
  {
    name: "findByProviderRef",
    type: "(gateway, providerRef) => Promise<PaymentRecord | null>",
    description: "Lookup used by the return-URL handler.",
  },
  {
    name: "updateStatus",
    type: "(id, status) => Promise<{ record, changed }>",
    description:
      "confirmed→confirmed is a no-op with changed: false (idempotent).",
  },
];

export const STATUS_ROWS: PropRow[] = [
  {
    name: "pending",
    type: "initial",
    description: "Created after initiate; awaiting user return.",
  },
  {
    name: "callback_received",
    type: "from handleCallback",
    description: "Browser returned — still untrusted.",
  },
  {
    name: "verifying",
    type: "before verify()",
    description: "Server-side check in progress.",
  },
  {
    name: "confirmed",
    type: "from verify() only",
    description: "Safe to fulfill the order.",
  },
  {
    name: "failed",
    type: "cancel / verify fail",
    description: "Do not deliver.",
  },
  {
    name: "refunded",
    type: "post-confirm",
    description: "Mapped from gateway refund statuses.",
  },
];

export const ESEWA_STATUS_ROWS: PropRow[] = [
  {
    name: "COMPLETE",
    type: "→ confirmed",
    description: "Only status meaning paid.",
  },
  {
    name: "PENDING / AMBIGUOUS",
    type: "→ pending",
    description: "Hold; do not fulfill.",
  },
  { name: "CANCELED / NOT_FOUND", type: "→ failed", description: "Not paid." },
  { name: "FULL_REFUND", type: "→ refunded", description: "Full refund." },
  {
    name: "PARTIAL_REFUND",
    type: "→ partially_refunded",
    description: "Partial refund.",
  },
];

export const KHALTI_STATUS_ROWS: PropRow[] = [
  {
    name: "Completed",
    type: "→ confirmed",
    description: "Only status meaning paid.",
  },
  {
    name: "Pending / Initiated",
    type: "→ pending",
    description: "Hold; contact Khalti if stuck.",
  },
  {
    name: "Expired / User canceled",
    type: "→ failed",
    description: "Not paid.",
  },
  { name: "Refunded", type: "→ refunded", description: "Full refund." },
  {
    name: "Partially refunded",
    type: "→ partially_refunded",
    description: "Partial refund.",
  },
];

export const CONNECTIPS_STATUS_ROWS: PropRow[] = [
  {
    name: "SUCCESS",
    type: "→ confirmed",
    description: "Only validatetxn status meaning paid.",
  },
  {
    name: "ERROR",
    type: "→ pending",
    description: "Txn not found / incomplete — re-poll; do not fulfill.",
  },
  {
    name: "FAILED",
    type: "→ failed",
    description: "Not paid.",
  },
];

export const CONNECTIPS_FORM_ROWS: PropRow[] = [
  {
    name: "MERCHANTID",
    type: "string",
    description: "NCHL merchant id (≤20).",
  },
  {
    name: "APPID",
    type: "string",
    description: "Application id (≤20). Also Basic Auth username.",
  },
  {
    name: "APPNAME",
    type: "string",
    description: "Display name on login page (≤30).",
  },
  {
    name: "TXNID",
    type: "string",
    description:
      "Unique txn id ≤20 — becomes providerRef / REFERENCEID default.",
  },
  {
    name: "TXNDATE",
    type: "DD-MM-YYYY",
    description: "Transaction date (Nepal calendar day as registered).",
  },
  {
    name: "TXNCRNCY",
    type: '"NPR"',
    description: "Always NPR for merchant payments.",
  },
  {
    name: "TXNAMT",
    type: "integer paisa",
    description: "NPR × 100 (e.g. 10.50 → 1050). Never send NPR decimals here.",
  },
  {
    name: "REFERENCEID",
    type: "string",
    description: "Merchant reference ≤20 (often same as TXNID).",
  },
  {
    name: "REMARKS",
    type: "string",
    description: "≤50 chars — order label.",
  },
  {
    name: "PARTICULARS",
    type: "string",
    description: "≤100 chars — order detail.",
  },
  {
    name: "TOKEN",
    type: "Base64",
    description:
      "SHA256withRSA over comma-joined fields ending TOKEN=TOKEN (no spaces after commas).",
  },
];

export const ERROR_ROWS: PropRow[] = [
  {
    name: "ConfigError",
    type: "CONFIG",
    description: "Missing keys, invalid amount, bad constructor options.",
  },
  {
    name: "SignatureMismatchError",
    type: "SIGNATURE_MISMATCH",
    description: "eSewa callback HMAC did not match — treat as tampering.",
  },
  {
    name: "VerificationFailedError",
    type: "VERIFICATION_FAILED",
    description: "verify() did not confirm payment.",
  },
  {
    name: "GatewayApiError",
    type: "GATEWAY_API",
    description:
      "Upstream HTTP / network / timeout. Includes statusCode + body.",
  },
  {
    name: "InvalidTransitionError",
    type: "INVALID_TRANSITION",
    description: "Illegal state machine move (e.g. callback → confirmed).",
  },
  {
    name: "RefundNotSupportedError",
    type: "REFUND_NOT_SUPPORTED",
    description: "refund() not integrated in v1.",
  },
];
