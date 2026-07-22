import { NrbValidationError } from "./errors";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** NRB publishes on Nepal Standard Time (UTC+5:45). */
export const NRB_TIME_ZONE = "Asia/Kathmandu";

/**
 * Soft TTL for the current NST calendar day.
 * NRB usually publishes once (~09:00–10:00 NST) but may revise slightly
 * during the business day — refresh every 2h to pick those up without
 * hammering the API.
 */
export const TODAY_SOFT_TTL_MS = 2 * 60 * 60 * 1000;

/** Format a Date or YYYY-MM-DD string as NRB `Y-m-d`. */
export function toIsoDate(input?: Date | string): string {
  if (input == null) {
    // Default "today" = Nepal business day, not UTC midnight.
    return formatNstDate(new Date());
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!ISO_DATE.test(trimmed)) {
      throw new NrbValidationError(
        `Expected date as YYYY-MM-DD or Date (got ${JSON.stringify(input)})`,
      );
    }
    assertRealCalendarDate(trimmed);
    return trimmed;
  }
  if (!(input instanceof Date) || Number.isNaN(input.getTime())) {
    throw new NrbValidationError("Invalid Date object");
  }
  return formatNstDate(input);
}

/** YYYY-MM-DD in Asia/Kathmandu. */
export function formatNstDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: NRB_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function formatUtcDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function assertRealCalendarDate(iso: string): void {
  const m = ISO_DATE.exec(iso);
  if (!m) return;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() + 1 !== month ||
    dt.getUTCDate() !== day
  ) {
    throw new NrbValidationError(`Invalid calendar date ${iso}`);
  }
}

export function assertRange(from: string, to: string): void {
  if (from > to) {
    throw new NrbValidationError(
      `Invalid range: from (${from}) must be ≤ to (${to})`,
    );
  }
}

/** Subtract `days` from an ISO date (UTC civil). */
export function shiftIsoDate(iso: string, days: number): string {
  const m = ISO_DATE.exec(iso);
  if (!m) throw new NrbValidationError(`Invalid date ${iso}`);
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatUtcDate(dt);
}

/**
 * TTL for caching a snapshot day (NRB / Nepal calendar):
 * - past NST dates: indefinite (`null`) — rates do not change after the day
 * - today / future: soft TTL (`TODAY_SOFT_TTL_MS`) so rare midday revisions land
 */
export function cacheTtlMsForDate(
  isoDate: string,
  now = new Date(),
): number | null {
  const todayNst = formatNstDate(now);
  if (isoDate < todayNst) return null;
  return TODAY_SOFT_TTL_MS;
}

/**
 * Suggested HTTP `s-maxage` / Next `revalidate` for a rates range.
 * Historical ranges are long-lived; anything touching "today" is soft.
 */
export function recommendedRevalidateSeconds(
  from: string,
  to: string,
  now = new Date(),
): number {
  const todayNst = formatNstDate(now);
  if (to < todayNst) return 7 * 24 * 60 * 60; // 7 days
  return Math.floor(TODAY_SOFT_TTL_MS / 1000); // 2 hours
}

export function normalizeCurrencyCode(code: string): string {
  if (typeof code !== "string" || !code.trim()) {
    throw new NrbValidationError("Currency code is required");
  }
  const iso3 = code.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(iso3)) {
    throw new NrbValidationError(
      `Currency must be a 3-letter ISO code (got ${JSON.stringify(code)})`,
    );
  }
  return iso3;
}
