import {
  BS_EPOCH_AD,
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_MONTH_DAYS,
} from "./data/calendar-data";
import type { BsCalendarData } from "./engine-types";

/** Bundled Panchanga tables (BS 2000–2100). */
export const DEFAULT_CALENDAR_DATA: BsCalendarData = {
  minYear: BS_MIN_YEAR,
  maxYear: BS_MAX_YEAR,
  epochAd: BS_EPOCH_AD,
  monthDays: BS_MONTH_DAYS,
  version: "2000-2100",
  source:
    "Community-verified Nepal Panchanga tables (shared with @itzsa/nepali-datepicker)",
};

export function getCalendarMeta(
  calendar: BsCalendarData = DEFAULT_CALENDAR_DATA,
): {
  minYear: number;
  maxYear: number;
  epochAd: BsCalendarData["epochAd"];
  version?: string;
  source?: string;
  yearCount: number;
} {
  return {
    minYear: calendar.minYear,
    maxYear: calendar.maxYear,
    epochAd: calendar.epochAd,
    version: calendar.version,
    source: calendar.source,
    yearCount: calendar.maxYear - calendar.minYear + 1,
  };
}

/**
 * Merge extra year rows onto a base calendar (e.g. extend past 2100).
 * Caller must supply a correct `epochAd` if `minYear` changes.
 */
export function extendCalendarData(
  base: BsCalendarData,
  extra: Readonly<Record<number, readonly number[]>>,
  patch?: Partial<Pick<BsCalendarData, "minYear" | "maxYear" | "version" | "source" | "epochAd">>,
): BsCalendarData {
  const years = [
    ...Object.keys(base.monthDays).map(Number),
    ...Object.keys(extra).map(Number),
  ];
  const minYear = patch?.minYear ?? Math.min(...years, base.minYear);
  const maxYear = patch?.maxYear ?? Math.max(...years, base.maxYear);
  return {
    ...base,
    ...patch,
    minYear,
    maxYear,
    monthDays: { ...base.monthDays, ...extra },
  };
}
