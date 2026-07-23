import { ConfigError } from "../core/errors";

/** Khalti requires amount > 1000 paisa (Rs. 10). */
export const KHALTI_MIN_NPR = 10.01;

/** Convert NPR decimal → paisa (integer). Avoids float drift via rounding. */
export function nprToPaisa(npr: number): number {
  if (!Number.isFinite(npr) || npr < 0) {
    throw new ConfigError("amount must be a non-negative finite NPR decimal");
  }
  return Math.round(npr * 100);
}

export function paisaToNpr(paisa: number): number {
  return paisa / 100;
}

/**
 * Format NPR for eSewa form fields.
 * Integers stay without trailing decimals (matches documented examples like `100`).
 */
export function formatNprAmount(n: number): string {
  if (!Number.isFinite(n) || n < 0) {
    throw new ConfigError("amount must be a non-negative finite NPR decimal");
  }
  if (Number.isInteger(n)) {
    return String(n);
  }
  return n.toFixed(2);
}

export function assertPositiveNpr(amount: number, label = "amount"): void {
  if (!Number.isFinite(amount) || !(amount > 0)) {
    throw new ConfigError(`${label} must be a positive NPR decimal`);
  }
}

export function assertKhaltiMinAmount(amountNpr: number): void {
  assertPositiveNpr(amountNpr);
  const paisa = nprToPaisa(amountNpr);
  if (!(paisa > 1000)) {
    throw new ConfigError(
      `Khalti requires amount > Rs. 10 (more than 1000 paisa); got ${amountNpr} NPR`,
    );
  }
}
