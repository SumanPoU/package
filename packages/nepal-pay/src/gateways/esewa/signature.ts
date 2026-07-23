import { createHmac } from "node:crypto";

/**
 * Build the eSewa canonical message string.
 * Field order is load-bearing — do not alphabetize.
 */
export function buildSignedMessage(
  fields: Record<string, string | number>,
  signedFieldNames: string[],
): string {
  return signedFieldNames.map((name) => `${name}=${fields[name]}`).join(",");
}

/**
 * HMAC-SHA256, base64-encoded — eSewa ePay v2 signature.
 */
export function sign(message: string, secretKey: string): string {
  return createHmac("sha256", secretKey).update(message).digest("base64");
}

/**
 * Sign the initiate payload using the fixed field order required by eSewa:
 * `total_amount,transaction_uuid,product_code`
 */
export function signInitiatePayload(
  totalAmount: string | number,
  transactionUuid: string,
  productCode: string,
  secretKey: string,
): { signature: string; signedFieldNames: string } {
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const message = buildSignedMessage(
    {
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
    },
    ["total_amount", "transaction_uuid", "product_code"],
  );
  return { signature: sign(message, secretKey), signedFieldNames };
}

/**
 * Verify a callback / response signature using the order in `signed_field_names`.
 */
export function verifySignature(
  fields: Record<string, string | number>,
  signedFieldNamesCsv: string,
  signature: string,
  secretKey: string,
): boolean {
  const names = signedFieldNamesCsv
    .split(",")
    .map((n) => n.trim())
    .filter((n) => n.length > 0 && n !== "signature");

  const message = buildSignedMessage(fields, names);
  const expected = sign(message, secretKey);

  // timing-safe compare
  if (expected.length !== signature.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}
