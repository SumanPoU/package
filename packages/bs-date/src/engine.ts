import {
  addDaysFor,
  addMonthsFor,
  addYearsFor,
  diffInBsYearsFor,
  diffInDaysFor,
} from "./arithmetic";
import {
  DEFAULT_CALENDAR_DATA,
  extendCalendarData,
  getCalendarMeta,
} from "./calendar-registry";
import {
  adToBsFor,
  assertValidBsDateFor,
  bsToAdFor,
  bsToAdPartsFor,
  coerceAdDate,
  coerceBsDateFor,
  daysInBsMonthFor,
  getDaysInBsYearFor,
  isValidBsDateFor,
  requireBsDateFor,
} from "./core";
import { DEFAULT_HOLIDAY_CALENDAR } from "./data/holidays-default";
import type { BsCalendarData, BsDateEngineOptions } from "./engine-types";
import { formatBs, formatBsIso, getBsMonthName, toNepaliNumerals } from "./format";
import {
  createHolidayLookup,
  mergeHolidayCalendars,
} from "./holiday-lookup";
import type {
  AdDateInput,
  BsDate,
  BsDateInput,
  HolidayCalendar,
  HolidayEntry,
  Locale,
} from "./types";

/**
 * Isolated BS date engine — own calendar table + holiday set.
 * Use this in servers/workers where global holiday state must not leak.
 */
export function createBsDateEngine(options: BsDateEngineOptions = {}) {
  const calendar = options.calendar ?? DEFAULT_CALENDAR_DATA;
  let holidayCalendar = options.holidays ?? DEFAULT_HOLIDAY_CALENDAR;
  let holidays = createHolidayLookup(holidayCalendar);

  const setHolidays = (next: HolidayCalendar) => {
    holidayCalendar = {
      asOf: next.asOf,
      yearRange: next.yearRange,
      entries: [...next.entries],
    };
    holidays = createHolidayLookup(holidayCalendar);
  };

  return {
    /** Bound calendar metadata. */
    getMeta: () => getCalendarMeta(calendar),
    getCalendarData: () => calendar,

    // convert
    adToBs: (input: AdDateInput) => adToBsFor(calendar, input),
    bsToAd: (input: BsDateInput) => bsToAdFor(calendar, input),
    bsToAdParts: (input: BsDateInput) => bsToAdPartsFor(calendar, input),
    todayBs: () => adToBsFor(calendar, new Date()),

    // validate
    isValidBsDate: (input: unknown) => isValidBsDateFor(calendar, input),
    assertValidBsDate: (date: BsDate) => assertValidBsDateFor(calendar, date),
    requireBsDate: (input: BsDateInput) => requireBsDateFor(calendar, input),
    coerceBsDate: (input: BsDateInput, validateOnly?: boolean) =>
      coerceBsDateFor(calendar, input, validateOnly),
    coerceAdDate,

    // calendar
    daysInBsMonth: (year: number, month: number) =>
      daysInBsMonthFor(calendar, year, month),
    getDaysInBsYear: (year: number) => getDaysInBsYearFor(calendar, year),
    startOfBsMonth: (input: BsDateInput): BsDate => {
      const d = requireBsDateFor(calendar, input);
      return { year: d.year, month: d.month, day: 1 };
    },
    endOfBsMonth: (input: BsDateInput): BsDate => {
      const d = requireBsDateFor(calendar, input);
      return {
        year: d.year,
        month: d.month,
        day: daysInBsMonthFor(calendar, d.year, d.month),
      };
    },
    getBsWeekday: (input: BsDateInput) => {
      const ad = bsToAdPartsFor(calendar, input);
      return new Date(Date.UTC(ad.year, ad.month - 1, ad.day)).getUTCDay();
    },
    isSaturday: (input: BsDateInput) => {
      const ad = bsToAdPartsFor(calendar, input);
      return (
        new Date(Date.UTC(ad.year, ad.month - 1, ad.day)).getUTCDay() === 6
      );
    },
    compareBs: (a: BsDateInput, b: BsDateInput) => {
      const x = requireBsDateFor(calendar, a);
      const y = requireBsDateFor(calendar, b);
      if (x.year !== y.year) return x.year < y.year ? -1 : 1;
      if (x.month !== y.month) return x.month < y.month ? -1 : 1;
      if (x.day !== y.day) return x.day < y.day ? -1 : 1;
      return 0;
    },

    // arithmetic
    addDays: (input: BsDateInput, n: number) =>
      addDaysFor(calendar, input, n),
    addMonths: (input: BsDateInput, n: number) =>
      addMonthsFor(calendar, input, n),
    addYears: (input: BsDateInput, n: number) =>
      addYearsFor(calendar, input, n),
    diffInDays: (a: BsDateInput, b: BsDateInput) =>
      diffInDaysFor(calendar, a, b),
    diffInBsYears: (a: BsDateInput, b: BsDateInput) =>
      diffInBsYearsFor(calendar, a, b),

    // format (locale helpers are pure)
    formatBs,
    formatBsIso,
    getBsMonthName,
    toNepaliNumerals,

    // holidays (instance-local)
    setHolidayCalendar: setHolidays,
    extendHolidayCalendar: (entries: readonly HolidayEntry[]) => {
      setHolidays({
        ...holidayCalendar,
        entries: [...holidayCalendar.entries, ...entries],
      });
    },
    resetHolidayCalendar: () => setHolidays(DEFAULT_HOLIDAY_CALENDAR),
    getHolidayCalendar: () => holidayCalendar,
    isPublicHoliday: (input: BsDateInput) =>
      holidays.isHoliday(requireBsDateFor(calendar, input)),
    getHolidayName: (input: BsDateInput, locale: Locale = "en") => {
      const hit = holidays.getNames(requireBsDateFor(calendar, input))[0];
      if (!hit) return null;
      return locale === "ne" ? hit.nameNe : hit.nameEn;
    },
    getHolidaysInMonth: (year: number, month: number) =>
      holidays.getInMonth(year, month),
  };
}

export type BsDateEngine = ReturnType<typeof createBsDateEngine>;

export {
  DEFAULT_CALENDAR_DATA,
  extendCalendarData,
  getCalendarMeta,
  mergeHolidayCalendars,
};

export type { BsCalendarData, BsDateEngineOptions };
