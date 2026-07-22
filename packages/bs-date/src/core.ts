import type { BsCalendarData } from "./engine-types";
import { BsInvalidError, BsParseError, BsRangeError } from "./errors";
import type { AdDate, AdDateInput, BsDate, BsDateInput } from "./types";

const DATE_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const MS_PER_DAY = 86_400_000;

export function parseDateString(input: string): AdDate {
  const m = DATE_RE.exec(input.trim());
  if (!m) {
    throw new BsParseError(
      `Expected YYYY-MM-DD string (got ${JSON.stringify(input)})`,
    );
  }
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
  };
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatIsoParts(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function coerceAdDate(input: AdDateInput): AdDate {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new BsInvalidError("Invalid Date");
    }
    return {
      year: input.getFullYear(),
      month: input.getMonth() + 1,
      day: input.getDate(),
    };
  }
  if (typeof input === "string") {
    const iso = input.includes("T") ? input.slice(0, 10) : input.trim();
    return parseDateString(iso);
  }
  if (
    input &&
    typeof input === "object" &&
    "year" in input &&
    "month" in input &&
    "day" in input
  ) {
    return {
      year: Number(input.year),
      month: Number(input.month),
      day: Number(input.day),
    };
  }
  throw new BsInvalidError("Expected Date, YYYY-MM-DD string, or AdDate");
}

function assertYear(calendar: BsCalendarData, year: number): void {
  if (
    !Number.isInteger(year) ||
    year < calendar.minYear ||
    year > calendar.maxYear
  ) {
    throw new BsRangeError(
      `BS year must be an integer between ${calendar.minYear} and ${calendar.maxYear} (got ${year})`,
    );
  }
}

function assertMonth(month: number): void {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new BsRangeError(`Month must be an integer 1–12 (got ${month})`);
  }
}

export function daysInBsMonthFor(
  calendar: BsCalendarData,
  year: number,
  month: number,
): number {
  assertYear(calendar, year);
  assertMonth(month);
  const days = calendar.monthDays[year]?.[month - 1];
  if (days == null) {
    throw new BsRangeError(`No calendar data for BS ${year}-${month}`);
  }
  return days;
}

export function getDaysInBsYearFor(
  calendar: BsCalendarData,
  year: number,
): number {
  assertYear(calendar, year);
  const row = calendar.monthDays[year];
  if (!row) throw new BsRangeError(`No calendar data for BS year ${year}`);
  return row.reduce((sum, d) => sum + d, 0);
}

export function assertValidBsDateFor(
  calendar: BsCalendarData,
  date: BsDate,
): void {
  const { year, month, day } = date;
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    throw new BsInvalidError("BS year/month/day must be integers");
  }
  assertYear(calendar, year);
  assertMonth(month);
  if (day < 1) {
    throw new BsInvalidError(`Invalid BS day ${day}`);
  }
  const max = daysInBsMonthFor(calendar, year, month);
  if (day > max) {
    throw new BsInvalidError(
      `Invalid BS date ${year}-${month}-${day}: month has only ${max} days`,
    );
  }
}

export function isValidBsDateFor(
  calendar: BsCalendarData,
  input: unknown,
): boolean {
  try {
    const d = coerceBsDateFor(calendar, input as BsDateInput, true);
    return d != null;
  } catch {
    return false;
  }
}

export function coerceBsDateFor(
  calendar: BsCalendarData,
  input: BsDateInput,
  validateOnly = false,
): BsDate | null {
  let parts: BsDate;

  if (typeof input === "string") {
    try {
      parts = parseDateString(input);
    } catch (e) {
      if (validateOnly) return null;
      throw e;
    }
  } else if (
    input &&
    typeof input === "object" &&
    "year" in input &&
    "month" in input &&
    "day" in input
  ) {
    parts = {
      year: Number(input.year),
      month: Number(input.month),
      day: Number(input.day),
    };
  } else {
    if (validateOnly) return null;
    throw new BsInvalidError("Expected BsDate or YYYY-MM-DD string");
  }

  try {
    assertValidBsDateFor(calendar, parts);
  } catch (e) {
    if (validateOnly) return null;
    throw e;
  }
  return parts;
}

export function requireBsDateFor(
  calendar: BsCalendarData,
  input: BsDateInput,
): BsDate {
  return coerceBsDateFor(calendar, input)!;
}

function daysFromBsEpoch(calendar: BsCalendarData, date: BsDate): number {
  assertValidBsDateFor(calendar, date);
  let days = 0;
  for (let y = calendar.minYear; y < date.year; y++) {
    days += getDaysInBsYearFor(calendar, y);
  }
  for (let m = 1; m < date.month; m++) {
    days += daysInBsMonthFor(calendar, date.year, m);
  }
  return days + (date.day - 1);
}

function utcCivilParts(ms: number): AdDate {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

function utcMsFromParts(parts: AdDate): number {
  return Date.UTC(parts.year, parts.month - 1, parts.day);
}

export function bsToAdPartsFor(
  calendar: BsCalendarData,
  input: BsDateInput,
): AdDate {
  const bs = requireBsDateFor(calendar, input);
  const offset = daysFromBsEpoch(calendar, bs);
  const epochMs = utcMsFromParts(calendar.epochAd);
  return utcCivilParts(epochMs + offset * MS_PER_DAY);
}

export function bsToAdFor(calendar: BsCalendarData, input: BsDateInput): Date {
  const ad = bsToAdPartsFor(calendar, input);
  return new Date(ad.year, ad.month - 1, ad.day);
}

export function adToBsFor(
  calendar: BsCalendarData,
  input: AdDateInput,
): BsDate {
  const ad = coerceAdDate(input);
  if (
    !Number.isInteger(ad.year) ||
    !Number.isInteger(ad.month) ||
    !Number.isInteger(ad.day)
  ) {
    throw new BsRangeError("AD year/month/day must be integers");
  }
  if (ad.month < 1 || ad.month > 12 || ad.day < 1 || ad.day > 31) {
    throw new BsRangeError(`Invalid AD date ${ad.year}-${ad.month}-${ad.day}`);
  }

  const epochMs = utcMsFromParts(calendar.epochAd);
  const targetMs = Date.UTC(ad.year, ad.month - 1, ad.day);
  let remaining = Math.round((targetMs - epochMs) / MS_PER_DAY);

  if (remaining < 0) {
    throw new BsRangeError(
      `AD date ${ad.year}-${ad.month}-${ad.day} is before supported BS range (${calendar.minYear}–${calendar.maxYear})`,
    );
  }

  let bsYear = calendar.minYear;
  while (bsYear <= calendar.maxYear) {
    const yearDays = getDaysInBsYearFor(calendar, bsYear);
    if (remaining < yearDays) break;
    remaining -= yearDays;
    bsYear += 1;
  }

  if (bsYear > calendar.maxYear) {
    throw new BsRangeError(
      `AD date ${ad.year}-${ad.month}-${ad.day} is after supported BS range (${calendar.minYear}–${calendar.maxYear})`,
    );
  }

  let bsMonth = 1;
  while (bsMonth <= 12) {
    const monthDays = daysInBsMonthFor(calendar, bsYear, bsMonth);
    if (remaining < monthDays) break;
    remaining -= monthDays;
    bsMonth += 1;
  }

  return { year: bsYear, month: bsMonth, day: remaining + 1 };
}

export function utcMsFromAdParts(parts: AdDate): number {
  return utcMsFromParts(parts);
}

export function adPartsFromUtcMs(ms: number): AdDate {
  return utcCivilParts(ms);
}

export { MS_PER_DAY };
