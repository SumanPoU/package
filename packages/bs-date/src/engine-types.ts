import type { AdDate, BsDate, HolidayCalendar, HolidayEntry } from "./types";

/** Month lengths for one BS year: index 0 = Baisakh … 11 = Chaitra. */
export type BsYearMonthDays =
  | readonly [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]
  | readonly number[];

/**
 * Pluggable BS calendar table.
 * Ship your own years beyond the bundled 2000–2100 range without forking.
 */
export type BsCalendarData = {
  /** Inclusive min BS year present in `monthDays`. */
  minYear: number;
  /** Inclusive max BS year present in `monthDays`. */
  maxYear: number;
  /**
   * AD civil date of BS `minYear-01-01`.
   * Bundled default: BS 2000-01-01 ↔ AD 1943-04-14.
   */
  epochAd: AdDate;
  /** year → 12 month lengths */
  monthDays: Readonly<Record<number, BsYearMonthDays>>;
  /** Optional data revision label for ops/debug. */
  version?: string;
  /** Human attribution / source note. */
  source?: string;
};

export type HolidayLookup = {
  isHoliday(date: BsDate): boolean;
  getNames(date: BsDate): HolidayEntry[];
  getInMonth(year: number, month: number): HolidayEntry[];
  getCalendar(): HolidayCalendar;
};

export type BsDateEngineOptions = {
  calendar?: BsCalendarData;
  holidays?: HolidayCalendar;
};
