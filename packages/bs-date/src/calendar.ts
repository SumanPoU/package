import { DEFAULT_CALENDAR_DATA } from "./calendar-registry";
import {
  bsToAdPartsFor,
  daysInBsMonthFor,
  getDaysInBsYearFor,
  requireBsDateFor,
} from "./core";
import type { BsDate, BsDateInput } from "./types";

export function startOfBsMonth(input: BsDateInput): BsDate {
  const d = requireBsDateFor(DEFAULT_CALENDAR_DATA, input);
  return { year: d.year, month: d.month, day: 1 };
}

export function endOfBsMonth(input: BsDateInput): BsDate {
  const d = requireBsDateFor(DEFAULT_CALENDAR_DATA, input);
  return {
    year: d.year,
    month: d.month,
    day: daysInBsMonthFor(DEFAULT_CALENDAR_DATA, d.year, d.month),
  };
}

/** Weekday: 0 = Sunday … 6 = Saturday (Nepal convention). */
export function getBsWeekday(input: BsDateInput): number {
  const ad = bsToAdPartsFor(DEFAULT_CALENDAR_DATA, input);
  return new Date(Date.UTC(ad.year, ad.month - 1, ad.day)).getUTCDay();
}

export function isSaturday(input: BsDateInput): boolean {
  return getBsWeekday(input) === 6;
}

export function compareBs(a: BsDateInput, b: BsDateInput): number {
  const x = requireBsDateFor(DEFAULT_CALENDAR_DATA, a);
  const y = requireBsDateFor(DEFAULT_CALENDAR_DATA, b);
  if (x.year !== y.year) return x.year < y.year ? -1 : 1;
  if (x.month !== y.month) return x.month < y.month ? -1 : 1;
  if (x.day !== y.day) return x.day < y.day ? -1 : 1;
  return 0;
}

export function daysInBsMonth(year: number, month: number): number {
  return daysInBsMonthFor(DEFAULT_CALENDAR_DATA, year, month);
}

export function getDaysInBsYear(year: number): number {
  return getDaysInBsYearFor(DEFAULT_CALENDAR_DATA, year);
}
