import { NrbValidationError } from "./errors";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Format a Date or YYYY-MM-DD string as NRB `Y-m-d`. */
export function toIsoDate(input?: Date | string): string {
  if (input == null) {
    return formatUtcDate(new Date());
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
  return formatUtcDate(input);
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
 * TTL for caching a snapshot day:
 * - past dates: indefinite (`null`)
 * - today / future: until next UTC midnight
 */
export function cacheTtlMsForDate(
  isoDate: string,
  now = new Date(),
): number | null {
  const today = formatUtcDate(now);
  if (isoDate < today) return null;
  const m = ISO_DATE.exec(isoDate);
  if (!m) return 60_000;
  const end = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1);
  return Math.max(1_000, end - now.getTime());
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
