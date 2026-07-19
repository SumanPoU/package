import { isValidBsDate } from "./convert";
import type { DateParts, DateTimeParts } from "./types";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function isValidTime(hour: number, minute: number, second = 0): boolean {
  return (
    Number.isInteger(hour) &&
    Number.isInteger(minute) &&
    Number.isInteger(second) &&
    hour >= 0 &&
    hour <= 23 &&
    minute >= 0 &&
    minute <= 59 &&
    second >= 0 &&
    second <= 59
  );
}

/**
 * Parse `YYYY-MM-DD HH:mm`, `YYYY-MM-DDTHH:mm`, or with `:ss`.
 * Date-only strings get `00:00:00`.
 */
export function parseDateTimeString(value: string): DateTimeParts | null {
  const trimmed = value.trim().replace(/\//g, "-");
  const m =
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/.exec(
      trimmed,
    );
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = m[4] != null ? Number(m[4]) : 0;
  const minute = m[5] != null ? Number(m[5]) : 0;
  const second = m[6] != null ? Number(m[6]) : 0;
  if (!isValidBsDate(year, month, day)) return null;
  if (!isValidTime(hour, minute, second)) return null;
  return { year, month, day, hour, minute, second };
}

export function toDateTimeString(
  parts: DateTimeParts,
  opts?: { withSeconds?: boolean },
): string {
  const base = `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)} ${pad2(parts.hour)}:${pad2(parts.minute)}`;
  if (opts?.withSeconds) {
    return `${base}:${pad2(parts.second ?? 0)}`;
  }
  return base;
}

export function dateTimeToDateParts(dt: DateTimeParts): DateParts {
  return { year: dt.year, month: dt.month, day: dt.day };
}

export function compareDateTimeParts(a: DateTimeParts, b: DateTimeParts): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  if (a.hour !== b.hour) return a.hour < b.hour ? -1 : 1;
  if (a.minute !== b.minute) return a.minute < b.minute ? -1 : 1;
  const as = a.second ?? 0;
  const bs = b.second ?? 0;
  if (as !== bs) return as < bs ? -1 : 1;
  return 0;
}

export function clampDateTime(
  parts: DateTimeParts,
  min?: DateTimeParts | null,
  max?: DateTimeParts | null,
): DateTimeParts {
  let next = parts;
  if (min && compareDateTimeParts(next, min) < 0) next = { ...min };
  if (max && compareDateTimeParts(next, max) > 0) next = { ...max };
  return next;
}

/** Bound string may be date-only (`YYYY-MM-DD`) or full datetime. */
export function parseDateTimeBound(
  value: string | undefined,
  edge: "min" | "max",
): DateTimeParts | null {
  if (!value) return null;
  const full = parseDateTimeString(value);
  if (full) {
    // Date-only input → start or end of that day
    const hasTime = /[T ]\d/.test(value.trim());
    if (!hasTime) {
      return edge === "min"
        ? { ...full, hour: 0, minute: 0, second: 0 }
        : { ...full, hour: 23, minute: 59, second: 59 };
    }
    return full;
  }
  return null;
}

export function isCompleteBsDateTime(
  value: string,
  opts?: { requireSeconds?: boolean },
): boolean {
  const dt = parseDateTimeString(value);
  if (!dt) return false;
  const hasTime = /[T ]\d{1,2}:\d{1,2}/.test(value.trim());
  if (!hasTime) return false;
  if (opts?.requireSeconds) {
    return /:\d{1,2}:\d{1,2}/.test(value.trim());
  }
  return true;
}

/** Round minute down to step (e.g. 15 → 0,15,30,45). */
export function snapMinute(minute: number, step: number): number {
  const s = Math.max(1, Math.min(30, Math.floor(step)));
  return Math.floor(minute / s) * s;
}
