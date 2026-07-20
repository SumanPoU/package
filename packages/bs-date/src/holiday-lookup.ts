import type { BsDate, HolidayCalendar, HolidayEntry } from "./types";
import type { HolidayLookup } from "./engine-types";

function key(year: number, month: number, day: number): string {
  return `${year}-${month}-${day}`;
}

function recurringKey(month: number, day: number): string {
  return `*-${month}-${day}`;
}

/**
 * Indexed holiday lookup — O(1) day checks, scalable to large org calendars.
 */
export function createHolidayLookup(
  calendar: HolidayCalendar,
): HolidayLookup {
  const byExact = new Map<string, HolidayEntry[]>();
  const byRecurring = new Map<string, HolidayEntry[]>();

  for (const entry of calendar.entries) {
    if (entry.year != null) {
      const k = key(entry.year, entry.month, entry.day);
      const list = byExact.get(k) ?? [];
      list.push(entry);
      byExact.set(k, list);
    } else {
      const k = recurringKey(entry.month, entry.day);
      const list = byRecurring.get(k) ?? [];
      list.push(entry);
      byRecurring.set(k, list);
    }
  }

  function getNames(date: BsDate): HolidayEntry[] {
    const exact = byExact.get(key(date.year, date.month, date.day)) ?? [];
    const recurring =
      byRecurring.get(recurringKey(date.month, date.day)) ?? [];
    return [...exact, ...recurring];
  }

  return {
    isHoliday(date) {
      return getNames(date).length > 0;
    },
    getNames,
    getInMonth(year, month) {
      const out: HolidayEntry[] = [];
      for (const entry of calendar.entries) {
        if (entry.month !== month) continue;
        if (entry.year != null && entry.year !== year) continue;
        out.push(entry);
      }
      return out;
    },
    getCalendar() {
      return calendar;
    },
  };
}

export function mergeHolidayCalendars(
  base: HolidayCalendar,
  ...extras: HolidayCalendar[]
): HolidayCalendar {
  return {
    asOf: extras[extras.length - 1]?.asOf ?? base.asOf,
    yearRange: extras[extras.length - 1]?.yearRange ?? base.yearRange,
    entries: [
      ...base.entries,
      ...extras.flatMap((c) => [...c.entries]),
    ],
  };
}
