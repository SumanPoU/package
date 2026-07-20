/**
 * BS calendar helpers for the datepicker UI.
 * Conversion math is delegated to `@itzsa/bs-date` (single source of truth).
 * Public signatures stay `(y, m, d) → DateParts` for backward compatibility.
 */
import {
  BS_EPOCH_AD,
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_MONTH_DAYS,
  BsDateError,
  addDays,
  adToBs as adToBsCore,
  bsToAdParts,
  daysInBsMonth,
  diffInDays,
  getBsWeekday as getBsWeekdayCore,
  getDaysInBsYear as getDaysInBsYearCore,
  isValidBsDate as isValidBsDateCore,
  todayBs as todayBsCore,
} from "@itzsa/bs-date";

import type { DateParts, DateTimeParts } from "./types";

function asRangeError(err: unknown): never {
  if (err instanceof BsDateError) {
    throw new RangeError(err.message);
  }
  throw err;
}

function run<T>(fn: () => T): T {
  try {
    return fn();
  } catch (err) {
    asRangeError(err);
  }
}

/** Days in a BS month (1–12). */
export function getDaysInBsMonth(year: number, month: number): number {
  return run(() => daysInBsMonth(year, month));
}

/** Total days in a BS year. */
export function getDaysInBsYear(year: number): number {
  return run(() => getDaysInBsYearCore(year));
}

export function isValidBsDate(
  year: number,
  month: number,
  day: number,
): boolean {
  return isValidBsDateCore({ year, month, day });
}

/**
 * Convert Bikram Sambat → Anno Domini (civil calendar).
 * Month is 1–12 (Baisakh = 1).
 */
export function bsToAd(year: number, month: number, day: number): DateParts {
  return run(() => bsToAdParts({ year, month, day }));
}

/**
 * Convert Anno Domini → Bikram Sambat.
 * Month is 1–12.
 */
export function adToBs(year: number, month: number, day: number): DateParts {
  return run(() => adToBsCore({ year, month, day }));
}

/** Today's date in BS (local timezone civil date → BS). */
export function todayBs(): DateParts {
  return todayBsCore();
}

/** Today + current local clock as BS datetime. */
export function todayBsDateTime(): DateTimeParts {
  const now = new Date();
  const date = adToBs(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return {
    ...date,
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds(),
  };
}

/** Weekday for a BS date: 0 = Sunday … 6 = Saturday (UTC civil). */
export function getBsWeekday(year: number, month: number, day: number): number {
  return run(() => getBsWeekdayCore({ year, month, day }));
}

/** Compare two date parts: -1 / 0 / 1. */
export function compareDateParts(a: DateParts, b: DateParts): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

export function clampBsDate(
  parts: DateParts,
  min?: DateParts | null,
  max?: DateParts | null,
): DateParts {
  let next = parts;
  if (min && compareDateParts(next, min) < 0) next = min;
  if (max && compareDateParts(next, max) > 0) next = max;
  return next;
}

export function addBsMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  const y = Math.floor(idx / 12);
  const m = (idx % 12) + 1;
  if (y < BS_MIN_YEAR || y > BS_MAX_YEAR) {
    throw new RangeError("Month navigation out of supported BS range");
  }
  return { year: y, month: m };
}

/** Signed day difference: `b − a` (same calendar day → 0). */
export function diffBsDays(a: DateParts, b: DateParts): number {
  return run(() => diffInDays(a, b));
}

/** Add (or subtract) days on the BS calendar via AD civil arithmetic. */
export function addBsDays(parts: DateParts, delta: number): DateParts {
  return run(() => addDays(parts, delta));
}

export { BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTH_DAYS, BS_EPOCH_AD };
