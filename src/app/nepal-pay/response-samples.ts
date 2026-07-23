/**
 * Documented success + error payloads for the nepal-pay docs playground.
 * Keep in sync with gateway adapters and official provider docs.
 */

export const ESEWA_INITIATE_SUCCESS = `{
  "ok": true,
  "gateway": "esewa",
  "mode": "sandbox",
  "initiate": {
    "redirectUrl": "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    "providerRef": "241028",
    "method": "POST",
    "formFields": {
      "amount": "110",
      "tax_amount": "0",
      "product_service_charge": "0",
      "product_delivery_charge": "0",
      "total_amount": "110",
      "transaction_uuid": "241028",
      "product_code": "EPAYTEST",
      "success_url": "https://example.com/pay/esewa/return",
      "failure_url": "https://example.com/pay/failed",
      "signed_field_names": "total_amount,transaction_uuid,product_code",
      "signature": "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME="
    }
  }
}`;

export const ESEWA_CALLBACK_SUCCESS = `{
  "transaction_code": "000AWEO",
  "status": "COMPLETE",
  "total_amount": 1000.0,
  "transaction_uuid": "250610-162413",
  "product_code": "EPAYTEST",
  "signed_field_names": "transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names",
  "signature": "<hmac-base64>"
}`;

export const ESEWA_STATUS_COMPLETE = `{
  "product_code": "EPAYTEST",
  "transaction_uuid": "240508-10108",
  "total_amount": 100.0,
  "status": "COMPLETE",
  "ref_id": "0007G36"
}`;

export const ESEWA_STATUS_PENDING = `{
  "product_code": "EPAYTEST",
  "transaction_uuid": "240508-101430",
  "total_amount": 100.0,
  "status": "PENDING",
  "ref_id": null
}`;

export const ESEWA_STATUS_CANCELED = `{
  "product_code": "EPAYTEST",
  "transaction_uuid": "240508-102939",
  "total_amount": 10.0,
  "status": "CANCELED",
  "ref_id": "0KDL6NA"
}`;

export const ESEWA_STATUS_NOT_FOUND = `{
  "product_code": "EPAYTEST",
  "transaction_uuid": "240508-101430",
  "total_amount": 100.0,
  "status": "NOT_FOUND",
  "ref_id": null
}`;

export const ESEWA_STATUS_AMBIGUOUS = `{
  "product_code": "EPAYTEST",
  "transaction_uuid": "240508-101431",
  "total_amount": 100.0,
  "status": "AMBIGUOUS",
  "ref_id": "0KDL6NA"
}`;

export const ESEWA_STATUS_FULL_REFUND = `{
  "product_code": "EPAYTEST",
  "transaction_uuid": "240508-101431",
  "total_amount": 100,
  "status": "FULL_REFUND",
  "ref_id": "0007G36"
}`;

export const ESEWA_STATUS_PARTIAL_REFUND = `{
  "product_code": "EPAYTEST",
  "transaction_uuid": "240508-101431",
  "total_amount": 100.0,
  "status": "PARTIAL_REFUND",
  "ref_id": "0007G36"
}`;

export const ESEWA_STATUS_UNAVAILABLE = `{
  "code": 0,
  "error_message": "Service is currently unavailable"
}`;

export const ESEWA_SIGNATURE_MISMATCH = `{
  "ok": false,
  "error": {
    "code": "SIGNATURE_MISMATCH",
    "name": "SignatureMismatchError",
    "message": "eSewa callback signature mismatch — possible tampering"
  }
}`;

export const ESEWA_CONFIG_ERROR = `{
  "ok": false,
  "error": {
    "code": "CONFIG",
    "name": "ConfigError",
    "message": "amount must be a positive NPR decimal"
  }
}`;

export const KHALTI_INITIATE_REQUEST = `{
  "return_url": "https://example.com/pay/khalti/return",
  "website_url": "https://example.com",
  "amount": 1050,
  "purchase_order_id": "order-42",
  "purchase_order_name": "Pro plan",
  "customer_info": {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9800000000"
  }
}`;

export const KHALTI_INITIATE_SUCCESS = `{
  "pidx": "bZQLD9wbdAi789cZ5GvUdF",
  "payment_url": "https://test-pay.khalti.com/?pidx=bZQLD9wbdAi789cZ5GvUdF",
  "expires_at": "2026-07-23T12:30:00.000000+05:45",
  "expires_in": 1800
}`;

export const KHALTI_CALLBACK_COMPLETED = `{
  "pidx": "bZQLD9wbdAi789cZ5GvUdF",
  "txnId": "4d5kjnABpA2n7LLxLh9cDP",
  "amount": 1050,
  "total_amount": 1050,
  "status": "Completed",
  "mobile": "98XXXXX000",
  "purchase_order_id": "order-42",
  "purchase_order_name": "Pro plan",
  "transaction_id": "4d5kjnABpA2n7LLxLh9cDP"
}`;

export const KHALTI_CALLBACK_CANCELED = `{
  "pidx": "bZQLD9wbdAi789cZ5GvUdF",
  "status": "User canceled",
  "purchase_order_id": "order-42",
  "purchase_order_name": "Pro plan"
}`;

export const KHALTI_LOOKUP_COMPLETED = `{
  "pidx": "bZQLD9wbdAi789cZ5GvUdF",
  "total_amount": 1050,
  "status": "Completed",
  "transaction_id": "4d5kjnABpA2n7LLxLh9cDP",
  "fee": 0,
  "refunded": false
}`;

export const KHALTI_LOOKUP_PENDING = `{
  "pidx": "bZQLD9wbdAi789cZ5GvUdF",
  "total_amount": 1050,
  "status": "Pending",
  "transaction_id": null,
  "fee": 0,
  "refunded": false
}`;

export const KHALTI_LOOKUP_CANCELED = `{
  "pidx": "bZQLD9wbdAi789cZ5GvUdF",
  "total_amount": 1050,
  "status": "User canceled",
  "transaction_id": null,
  "fee": 0,
  "refunded": false
}`;

export const KHALTI_LOOKUP_EXPIRED = `{
  "pidx": "bZQLD9wbdAi789cZ5GvUdF",
  "total_amount": 1050,
  "status": "Expired",
  "transaction_id": null,
  "fee": 0,
  "refunded": false
}`;

export const KHALTI_AUTH_ERROR = `{
  "ok": false,
  "error": {
    "code": "GATEWAY_API",
    "name": "GatewayApiError",
    "message": "Lookup failed with HTTP 401",
    "gateway": "khalti",
    "statusCode": 401,
    "body": { "detail": "Invalid token." }
  }
}`;

export const KHALTI_VALIDATION_ERROR = `{
  "ok": false,
  "error": {
    "code": "GATEWAY_API",
    "name": "GatewayApiError",
    "message": "Initiate failed with HTTP 400",
    "gateway": "khalti",
    "statusCode": 400,
    "body": {
      "amount": ["Amount should be greater than 1000 (Rs. 10)."],
      "return_url": ["This field is required."]
    }
  }
}`;

export const SDK_VERIFY_CONFIRMED = `{
  "status": "confirmed",
  "providerRef": "bZQLD9wbdAi789cZ5GvUdF",
  "amount": 10.5,
  "transactionId": "4d5kjnABpA2n7LLxLh9cDP",
  "raw": { "status": "Completed", "total_amount": 1050 }
}`;

export const SDK_VERIFY_FAILED = `{
  "status": "failed",
  "providerRef": "bZQLD9wbdAi789cZ5GvUdF",
  "amount": 10.5,
  "raw": { "status": "User canceled", "total_amount": 1050 }
}`;

export const SDK_CALLBACK_RECEIVED = `{
  "kind": "callback_received",
  "providerRef": "bZQLD9wbdAi789cZ5GvUdF",
  "raw": { "pidx": "bZQLD9wbdAi789cZ5GvUdF", "status": "Completed" }
}`;

export const SDK_CALLBACK_CANCELLED = `{
  "kind": "callback_cancelled",
  "providerRef": "bZQLD9wbdAi789cZ5GvUdF",
  "reason": "Khalti status: User canceled",
  "raw": { "pidx": "bZQLD9wbdAi789cZ5GvUdF", "status": "User canceled" }
}`;

export const RETURN_HANDLER_SUCCESS = `{
  "redirectTo": "https://example.com/pay/success",
  "paymentId": "clx…",
  "status": "confirmed"
}`;

export const RETURN_HANDLER_FAILURE = `{
  "redirectTo": "https://example.com/pay/failed",
  "paymentId": "clx…",
  "status": "failed"
}`;

export type ResponseSample = {
  id: string;
  label: string;
  kind: "success" | "error" | "info";
  gateway: "esewa" | "khalti" | "sdk";
  json: string;
  note: string;
};

export const RESPONSE_SAMPLES: ResponseSample[] = [
  {
    id: "esewa-initiate-ok",
    label: "eSewa initiate (SDK)",
    kind: "success",
    gateway: "esewa",
    json: ESEWA_INITIATE_SUCCESS,
    note: "method POST + formFields — render an HTML form, do not GET this URL.",
  },
  {
    id: "esewa-callback-ok",
    label: "eSewa callback (decoded)",
    kind: "success",
    gateway: "esewa",
    json: ESEWA_CALLBACK_SUCCESS,
    note: "Base64-decoded data query param. Re-verify signature; still call status API.",
  },
  {
    id: "esewa-status-complete",
    label: "eSewa status COMPLETE",
    kind: "success",
    gateway: "esewa",
    json: ESEWA_STATUS_COMPLETE,
    note: "Only COMPLETE maps to confirmed / deliver service.",
  },
  {
    id: "esewa-status-pending",
    label: "eSewa status PENDING",
    kind: "info",
    gateway: "esewa",
    json: ESEWA_STATUS_PENDING,
    note: "Hold — do not fulfill.",
  },
  {
    id: "esewa-status-canceled",
    label: "eSewa status CANCELED",
    kind: "error",
    gateway: "esewa",
    json: ESEWA_STATUS_CANCELED,
    note: "Maps to failed.",
  },
  {
    id: "esewa-status-not-found",
    label: "eSewa status NOT_FOUND",
    kind: "error",
    gateway: "esewa",
    json: ESEWA_STATUS_NOT_FOUND,
    note: "Session expired / never completed.",
  },
  {
    id: "esewa-status-ambiguous",
    label: "eSewa status AMBIGUOUS",
    kind: "info",
    gateway: "esewa",
    json: ESEWA_STATUS_AMBIGUOUS,
    note: "Maps to pending — investigate before fulfilling.",
  },
  {
    id: "esewa-status-full-refund",
    label: "eSewa status FULL_REFUND",
    kind: "info",
    gateway: "esewa",
    json: ESEWA_STATUS_FULL_REFUND,
    note: "Maps to refunded.",
  },
  {
    id: "esewa-status-partial-refund",
    label: "eSewa status PARTIAL_REFUND",
    kind: "info",
    gateway: "esewa",
    json: ESEWA_STATUS_PARTIAL_REFUND,
    note: "Maps to partially_refunded.",
  },
  {
    id: "esewa-unavailable",
    label: "eSewa service unavailable",
    kind: "error",
    gateway: "esewa",
    json: ESEWA_STATUS_UNAVAILABLE,
    note: "Surfaces as GatewayApiError — retry with backoff.",
  },
  {
    id: "esewa-sig-mismatch",
    label: "SignatureMismatchError",
    kind: "error",
    gateway: "esewa",
    json: ESEWA_SIGNATURE_MISMATCH,
    note: "Tampered callback — never mark paid.",
  },
  {
    id: "esewa-config",
    label: "ConfigError (bad amount)",
    kind: "error",
    gateway: "esewa",
    json: ESEWA_CONFIG_ERROR,
    note: "Thrown before any network call.",
  },
  {
    id: "khalti-initiate-req",
    label: "Khalti initiate request",
    kind: "info",
    gateway: "khalti",
    json: KHALTI_INITIATE_REQUEST,
    note: "amount is paisa (NPR × 100). Auth: Authorization: Key <secret>.",
  },
  {
    id: "khalti-initiate-ok",
    label: "Khalti initiate success",
    kind: "success",
    gateway: "khalti",
    json: KHALTI_INITIATE_SUCCESS,
    note: "Redirect user to payment_url. Links expire (~60 min prod).",
  },
  {
    id: "khalti-callback-ok",
    label: "Khalti callback Completed",
    kind: "info",
    gateway: "khalti",
    json: KHALTI_CALLBACK_COMPLETED,
    note: "No signature — untrusted. Always call lookup.",
  },
  {
    id: "khalti-callback-cancel",
    label: "Khalti callback canceled",
    kind: "error",
    gateway: "khalti",
    json: KHALTI_CALLBACK_CANCELED,
    note: "handleCallback → callback_cancelled → failed.",
  },
  {
    id: "khalti-lookup-ok",
    label: "Khalti lookup Completed",
    kind: "success",
    gateway: "khalti",
    json: KHALTI_LOOKUP_COMPLETED,
    note: "Only Completed means deliver service.",
  },
  {
    id: "khalti-lookup-pending",
    label: "Khalti lookup Pending",
    kind: "info",
    gateway: "khalti",
    json: KHALTI_LOOKUP_PENDING,
    note: "Hold; contact Khalti if stuck.",
  },
  {
    id: "khalti-lookup-cancel",
    label: "Khalti lookup User canceled",
    kind: "error",
    gateway: "khalti",
    json: KHALTI_LOOKUP_CANCELED,
    note: "Maps to failed.",
  },
  {
    id: "khalti-lookup-expired",
    label: "Khalti lookup Expired",
    kind: "error",
    gateway: "khalti",
    json: KHALTI_LOOKUP_EXPIRED,
    note: "Maps to failed.",
  },
  {
    id: "khalti-auth",
    label: "Khalti 401 Invalid token",
    kind: "error",
    gateway: "khalti",
    json: KHALTI_AUTH_ERROR,
    note: "Wrong Authorization header (Bearer instead of Key) is a common cause.",
  },
  {
    id: "khalti-validation",
    label: "Khalti 400 validation",
    kind: "error",
    gateway: "khalti",
    json: KHALTI_VALIDATION_ERROR,
    note: "Typed GatewayApiError with upstream body.",
  },
  {
    id: "sdk-callback-ok",
    label: "SDK CallbackResult received",
    kind: "info",
    gateway: "sdk",
    json: SDK_CALLBACK_RECEIVED,
    note: "No confirmed variant exists on this type.",
  },
  {
    id: "sdk-callback-cancel",
    label: "SDK CallbackResult cancelled",
    kind: "error",
    gateway: "sdk",
    json: SDK_CALLBACK_CANCELLED,
    note: "Return-URL handler marks payment failed.",
  },
  {
    id: "sdk-verify-ok",
    label: "SDK VerificationResult confirmed",
    kind: "success",
    gateway: "sdk",
    json: SDK_VERIFY_CONFIRMED,
    note: "Safe to fulfill / run onConfirmed.",
  },
  {
    id: "sdk-verify-fail",
    label: "SDK VerificationResult failed",
    kind: "error",
    gateway: "sdk",
    json: SDK_VERIFY_FAILED,
    note: "Do not deliver.",
  },
  {
    id: "sdk-return-ok",
    label: "Return handler success",
    kind: "success",
    gateway: "sdk",
    json: RETURN_HANDLER_SUCCESS,
    note: "redirectTo your successUrl.",
  },
  {
    id: "sdk-return-fail",
    label: "Return handler failure",
    kind: "error",
    gateway: "sdk",
    json: RETURN_HANDLER_FAILURE,
    note: "redirectTo your failureUrl.",
  },
];
