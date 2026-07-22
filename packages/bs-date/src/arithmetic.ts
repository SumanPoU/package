import { compareBs } from "./calendar";
import { DEFAULT_CALENDAR_DATA } from "./calendar-registry";
import {
  adPartsFromUtcMs,
  adToBsFor,
  bsToAdPartsFor,
  daysInBsMonthFor,
  MS_PER_DAY,
  requireBsDateFor,
  utcMsFromAdParts,
} from "./core";
import type { BsCalendarData } from "./engine-types";
import { BsRangeError } from "./errors";
import type { BsDate, BsDateInput } from "./types";

function addDaysFor(
  calendar: BsCalendarData,
  input: BsDateInput,
  n: number,
): BsDate {
  if (!Number.isInteger(n)) {
    throw new BsRangeError("Day delta must be an integer");
  }
  const ad = bsToAdPartsFor(calendar, input);
  const next = adPartsFromUtcMs(utcMsFromAdParts(ad) + n * MS_PER_DAY);
  return adToBsFor(calendar, next);
}

function addMonthsFor(
  calendar: BsCalendarData,
  input: BsDateInput,
  n: number,
): BsDate {
  if (!Number.isInteger(n)) {
    throw new BsRangeError("Month delta must be an integer");
  }
  const d = requireBsDateFor(calendar, input);
  const idx = d.year * 12 + (d.month - 1) + n;
  const year = Math.floor(idx / 12);
  const month = (idx % 12) + 1;
  if (year < calendar.minYear || year > calendar.maxYear) {
    throw new BsRangeError("Month navigation out of supported BS range");
  }
  const maxDay = daysInBsMonthFor(calendar, year, month);
  return { year, month, day: Math.min(d.day, maxDay) };
}

function addYearsFor(
  calendar: BsCalendarData,
  input: BsDateInput,
  n: number,
): BsDate {
  if (!Number.isInteger(n)) {
    throw new BsRangeError("Year delta must be an integer");
  }
  const d = requireBsDateFor(calendar, input);
  const year = d.year + n;
  if (year < calendar.minYear || year > calendar.maxYear) {
    throw new BsRangeError("Year navigation out of supported BS range");
  }
  const maxDay = daysInBsMonthFor(calendar, year, d.month);
  return { year, month: d.month, day: Math.min(d.day, maxDay) };
}

function diffInDaysFor(
  calendar: BsCalendarData,
  a: BsDateInput,
  b: BsDateInput,
): number {
  const adA = bsToAdPartsFor(calendar, a);
  const adB = bsToAdPartsFor(calendar, b);
  return Math.round(
    (utcMsFromAdParts(adB) - utcMsFromAdParts(adA)) / MS_PER_DAY,
  );
}

function diffInBsYearsFor(
  calendar: BsCalendarData,
  a: BsDateInput,
  b: BsDateInput,
): number {
  const from = requireBsDateFor(calendar, a);
  const to = requireBsDateFor(calendar, b);
  const cmp = compareBs(from, to);
  if (cmp === 0) return 0;

  const earlier = cmp < 0 ? from : to;
  const later = cmp < 0 ? to : from;
  let years = later.year - earlier.year;
  if (
    later.month < earlier.month ||
    (later.month === earlier.month && later.day < earlier.day)
  ) {
    years -= 1;
  }
  return cmp < 0 ? years : -years;
}

export function addDays(input: BsDateInput, n: number): BsDate {
  return addDaysFor(DEFAULT_CALENDAR_DATA, input, n);
}

export function addMonths(input: BsDateInput, n: number): BsDate {
  return addMonthsFor(DEFAULT_CALENDAR_DATA, input, n);
}

export function addYears(input: BsDateInput, n: number): BsDate {
  return addYearsFor(DEFAULT_CALENDAR_DATA, input, n);
}

export function diffInDays(a: BsDateInput, b: BsDateInput): number {
  return diffInDaysFor(DEFAULT_CALENDAR_DATA, a, b);
}

export function diffInBsYears(a: BsDateInput, b: BsDateInput): number {
  return diffInBsYearsFor(DEFAULT_CALENDAR_DATA, a, b);
}

export {
  addDaysFor,
  addMonthsFor,
  addYearsFor,
  diffInDaysFor,
  diffInBsYearsFor,
};
