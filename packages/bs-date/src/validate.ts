import { DEFAULT_CALENDAR_DATA } from "./calendar-registry";
import {
  assertValidBsDateFor,
  coerceAdDate,
  coerceBsDateFor,
  daysInBsMonthFor,
  isValidBsDateFor,
  parseDateString,
  requireBsDateFor,
  pad2,
  formatIsoParts,
} from "./core";
import type { BsDate, BsDateInput } from "./types";

export {
  coerceAdDate,
  parseDateString,
  pad2,
  formatIsoParts,
};

export function isValidBsDate(input: unknown): boolean {
  return isValidBsDateFor(DEFAULT_CALENDAR_DATA, input);
}

export function assertValidBsDate(date: BsDate): void {
  assertValidBsDateFor(DEFAULT_CALENDAR_DATA, date);
}

export function coerceBsDate(
  input: BsDateInput,
  options?: { validateOnly?: boolean },
): BsDate | null {
  return coerceBsDateFor(
    DEFAULT_CALENDAR_DATA,
    input,
    options?.validateOnly ?? false,
  );
}

export function requireBsDate(input: BsDateInput): BsDate {
  return requireBsDateFor(DEFAULT_CALENDAR_DATA, input);
}

export function daysInBsMonth(year: number, month: number): number {
  return daysInBsMonthFor(DEFAULT_CALENDAR_DATA, year, month);
}

export function assertBsYear(year: number): void {
  assertValidBsDateFor(DEFAULT_CALENDAR_DATA, {
    year,
    month: 1,
    day: 1,
  });
}

export function assertMonth(month: number): void {
  daysInBsMonthFor(DEFAULT_CALENDAR_DATA, DEFAULT_CALENDAR_DATA.minYear, month);
}
