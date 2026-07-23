/**
 * eSewa UAT credentials.
 *
 * Official developer docs sometimes show the secret with a trailing `(`.
 * Live sandbox rejects that (`ES104 Invalid payload signature`).
 * Working merchant samples and SDKs use the key **without** the parenthesis.
 */
export const ESEWA_UAT_PRODUCT_CODE = "EPAYTEST";
export const ESEWA_UAT_SECRET_KEY = "8gBm/:&EnhH.1/q";

/** Incorrect spelling that appears in some eSewa doc pages — do not use. */
export const ESEWA_UAT_SECRET_KEY_DOCS_TYPO = "8gBm/:&EnhH.1/q(";
