import { NrbValidationError } from "./errors";
import { perUnitRates } from "./parse";
import type { ForexRate, ForexSide } from "./types";

/**
 * Convert `amount` of foreign currency → NPR using a fetched rate.
 * Always applies `rate / unit` so JPY (unit 10) and INR (unit 100) stay correct.
 */
export function convertAmount(
  amount: number,
  rate: ForexRate,
  side: ForexSide = "mid",
): number {
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    throw new NrbValidationError("amount must be a finite number");
  }
  const per = perUnitRates(rate);
  const nprPerUnit =
    side === "buy" ? per.buy : side === "sell" ? per.sell : per.mid;
  return amount * nprPerUnit;
}

/**
 * Inverse: NPR → foreign currency units.
 */
export function convertFromNpr(
  nprAmount: number,
  rate: ForexRate,
  side: ForexSide = "mid",
): number {
  if (typeof nprAmount !== "number" || !Number.isFinite(nprAmount)) {
    throw new NrbValidationError("amount must be a finite number");
  }
  const per = perUnitRates(rate);
  const nprPerUnit =
    side === "buy" ? per.buy : side === "sell" ? per.sell : per.mid;
  if (nprPerUnit === 0) {
    throw new NrbValidationError("Cannot convert with a zero rate");
  }
  return nprAmount / nprPerUnit;
}
