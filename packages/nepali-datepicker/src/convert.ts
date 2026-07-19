import {
  BS_EPOCH_AD,
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_MONTH_DAYS,
} from "./calendar-data";
import type { DateParts } from "./types";

const MS_PER_DAY = 86_400_000;

function assertYear(year: number): void {
  if (!Number.isInteger(year) || year < BS_MIN_YEAR || year > BS_MAX_YEAR) {
    throw new RangeError(
      `BS year must be an integer between ${BS_MIN_YEAR} and ${BS_MAX_YEAR} (got ${year})`,
    );
  }
}

function assertMonth(month: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`Month must be an integer 1–12 (got ${month})`);
  }
}

/** Days in a BS month (1–12). */
export function getDaysInBsMonth(year: number, month: number): number {
  assertYear(year);
  assertMonth(month);
  return BS_MONTH_DAYS[year]![month - 1]!;
}

/** Total days in a BS year. */
export function getDaysInBsYear(year: number): number {
  assertYear(year);
  return BS_MONTH_DAYS[year]!.reduce((sum, d) => sum + d, 0);
}

export function isValidBsDate(year: number, month: number, day: number): boolean {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }
  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const max = BS_MONTH_DAYS[year]?.[month - 1];
  if (max == null) return false;
  return day <= max;
}

function assertBsDate(year: number, month: number, day: number): void {
  if (!isValidBsDate(year, month, day)) {
    throw new RangeError(`Invalid BS date ${year}-${month}-${day}`);
  }
}

/** Days from BS 2000-01-01 to the given BS date (0-based). */
function daysFromBsEpoch(year: number, month: number, day: number): number {
  assertBsDate(year, month, day);
  let days = 0;
  for (let y = BS_MIN_YEAR; y < year; y++) {
    days += getDaysInBsYear(y);
  }
  for (let m = 1; m < month; m++) {
    days += getDaysInBsMonth(year, m);
  }
  return days + (day - 1);
}

function utcCivilParts(ms: number): DateParts {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function utcMsFromParts(parts: DateParts): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

/**
 * Convert Bikram Sambat → Anno Domini (civil calendar).
 * Month is 1–12 (Baisakh = 1).
 */
export function bsToAd(year: number, month: number, day: number): DateParts {
  const offset = daysFromBsEpoch(year, month, day);
  const epochMs = utcMsFromParts(BS_EPOCH_AD);
  return utcCivilParts(epochMs + offset * MS_PER_DAY);
}

/**
 * Convert Anno Domini → Bikram Sambat.
 * Month is 1–12.
 */
export function adToBs(year: number, month: number, day: number): DateParts {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new RangeError("AD year/month/day must be integers");
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new RangeError(`Invalid AD date ${year}-${month}-${day}`);
  }

  const epochMs = utcMsFromParts(BS_EPOCH_AD);
  const targetMs = Date.UTC(year, month - 1, day);
  let remaining = Math.round((targetMs - epochMs) / MS_PER_DAY);

  if (remaining < 0) {
    throw new RangeError(
      `AD date ${year}-${month}-${day} is before supported BS range`,
    );
  }

  let bsYear = BS_MIN_YEAR;
  while (bsYear <= BS_MAX_YEAR) {
    const yearDays = getDaysInBsYear(bsYear);
    if (remaining < yearDays) break;
    remaining -= yearDays;
    bsYear += 1;
  }

  if (bsYear > BS_MAX_YEAR) {
    throw new RangeError(
      `AD date ${year}-${month}-${day} is after supported BS range`,
    );
  }

  let bsMonth = 1;
  while (bsMonth <= 12) {
    const monthDays = getDaysInBsMonth(bsYear, bsMonth);
    if (remaining < monthDays) break;
    remaining -= monthDays;
    bsMonth += 1;
  }

  return { year: bsYear, month: bsMonth, day: remaining + 1 };
}

/** Today's date in BS (local timezone civil date → BS). */
export function todayBs(): DateParts {
  const now = new Date();
  return adToBs(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** Weekday for a BS date: 0 = Sunday … 6 = Saturday (UTC civil). */
export function getBsWeekday(year: number, month: number, day: number): number {
  const ad = bsToAd(year, month, day);
  return new Date(Date.UTC(ad.year, ad.month - 1, ad.day)).getUTCDay();
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
  const adA = bsToAd(a.year, a.month, a.day);
  const adB = bsToAd(b.year, b.month, b.day);
  return Math.round(
    (utcMsFromParts(adB) - utcMsFromParts(adA)) / MS_PER_DAY,
  );
}

/** Add (or subtract) days on the BS calendar via AD civil arithmetic. */
export function addBsDays(parts: DateParts, delta: number): DateParts {
  const ad = bsToAd(parts.year, parts.month, parts.day);
  const next = utcCivilParts(utcMsFromParts(ad) + delta * MS_PER_DAY);
  return adToBs(next.year, next.month, next.day);
}

export { BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTH_DAYS, BS_EPOCH_AD };
