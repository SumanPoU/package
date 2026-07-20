/** Locale for month names, holiday labels, and optional Devanagari digits. */
export type Locale = "en" | "ne";

/**
 * Bikram Sambat calendar date.
 * Month is 1–12 where 1 = Baisakh (बैशाख) and 12 = Chaitra (चैत).
 */
export type BsDate = {
  year: number;
  month: number;
  day: number;
};

/** Anno Domini (Gregorian) civil date parts. */
export type AdDate = {
  year: number;
  month: number;
  day: number;
};

export type HolidayKind =
  | "national"
  | "religious"
  | "observance"
  | "custom";

export type HolidayEntry = {
  /** BS year (omit for recurring month/day every year in range). */
  year?: number;
  month: number;
  day: number;
  nameEn: string;
  nameNe: string;
  kind?: HolidayKind;
};

export type HolidayCalendar = {
  /** Human note for consumers (currency of government lists, etc.). */
  asOf?: string;
  /** Inclusive BS year range this calendar claims coverage for. */
  yearRange?: { min: number; max: number };
  entries: readonly HolidayEntry[];
};

/** Accept structured BS date or `YYYY-MM-DD` string. */
export type BsDateInput = BsDate | string;

/** Accept `Date`, ISO/`YYYY-MM-DD` string, or AD parts. */
export type AdDateInput = Date | string | AdDate;
