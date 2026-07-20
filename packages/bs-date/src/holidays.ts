import { DEFAULT_HOLIDAY_CALENDAR } from "./data/holidays-default";
import {
  createHolidayLookup,
  mergeHolidayCalendars,
} from "./holiday-lookup";
import type { HolidayLookup } from "./engine-types";
import type {
  BsDateInput,
  HolidayCalendar,
  HolidayEntry,
  Locale,
} from "./types";
import { requireBsDate } from "./validate";

let activeCalendar: HolidayCalendar = DEFAULT_HOLIDAY_CALENDAR;
let lookup: HolidayLookup = createHolidayLookup(activeCalendar);

function rebuild(calendar: HolidayCalendar): void {
  activeCalendar = {
    asOf: calendar.asOf,
    yearRange: calendar.yearRange,
    entries: [...calendar.entries],
  };
  lookup = createHolidayLookup(activeCalendar);
}

/** Replace the active holiday calendar (org-specific lists, bank calendars, …). */
export function setHolidayCalendar(calendar: HolidayCalendar): void {
  rebuild(calendar);
}

/** Merge extra entries into the current calendar. */
export function extendHolidayCalendar(entries: readonly HolidayEntry[]): void {
  rebuild({
    ...activeCalendar,
    entries: [...activeCalendar.entries, ...entries],
  });
}

/** Restore the bundled sample calendar. */
export function resetHolidayCalendar(): void {
  rebuild(DEFAULT_HOLIDAY_CALENDAR);
}

export function getHolidayCalendar(): HolidayCalendar {
  return activeCalendar;
}

export function isPublicHoliday(input: BsDateInput): boolean {
  return lookup.isHoliday(requireBsDate(input));
}

export function getHolidayName(
  input: BsDateInput,
  locale: Locale = "en",
): string | null {
  const hit = lookup.getNames(requireBsDate(input))[0];
  if (!hit) return null;
  return locale === "ne" ? hit.nameNe : hit.nameEn;
}

export function getHolidaysInMonth(
  year: number,
  month: number,
): HolidayEntry[] {
  return lookup.getInMonth(year, month);
}

export {
  DEFAULT_HOLIDAY_CALENDAR,
  createHolidayLookup,
  mergeHolidayCalendars,
};
