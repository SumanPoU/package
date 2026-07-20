import { DEFAULT_CALENDAR_DATA } from "./calendar-registry";
import {
  adPartsFromUtcMs,
  adToBsFor,
  bsToAdFor,
  bsToAdPartsFor,
  utcMsFromAdParts,
} from "./core";
import {
  BS_EPOCH_AD,
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_MONTH_DAYS,
} from "./data/calendar-data";
import type { AdDateInput, BsDate, BsDateInput } from "./types";

export { BS_EPOCH_AD, BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTH_DAYS };

export function bsToAd(input: BsDateInput): Date {
  return bsToAdFor(DEFAULT_CALENDAR_DATA, input);
}

export function bsToAdParts(input: BsDateInput) {
  return bsToAdPartsFor(DEFAULT_CALENDAR_DATA, input);
}

export function adToBs(input: AdDateInput): BsDate {
  return adToBsFor(DEFAULT_CALENDAR_DATA, input);
}

export function todayBs(): BsDate {
  return adToBs(new Date());
}

/** @internal */
export function _utcMsFromAdParts(
  parts: Parameters<typeof utcMsFromAdParts>[0],
) {
  return utcMsFromAdParts(parts);
}

/** @internal */
export function _adPartsFromUtcMs(ms: number) {
  return adPartsFromUtcMs(ms);
}

export function getDaysInBsYear(year: number): number {
  const row = BS_MONTH_DAYS[year];
  if (!row) {
    throw new Error(`No calendar data for BS year ${year}`);
  }
  return row.reduce((sum, d) => sum + d, 0);
}
