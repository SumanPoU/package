import { isValidBsDate } from "./convert";
import { getMonthName, localizeDigits } from "./locale";
import type { DateParts, DatePattern, Locale } from "./types";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

const BS_DATE_COMPLETE = /^\d{4}[-/]\d{2}[-/]\d{2}$/;

/** Parse `YYYY-MM-DD` or `YYYY/MM/DD` (ASCII) into parts. Returns null if invalid. */
export function parseDateString(value: string): DateParts | null {
  const trimmed = value.trim().replace(/\//g, "-");
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!isValidBsDate(year, month, day)) return null;
  return { year, month, day };
}

/**
 * Mask typed digits into `YYYY-MM-DD` as the user types (max 8 digits).
 * Does not validate calendar correctness — only formatting.
 */
export function formatTypedBsDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

/** True when the string is a complete, calendar-valid BS date. */
export function isCompleteBsDate(value: string): boolean {
  const normalized = value.trim().replace(/\//g, "-");
  if (!BS_DATE_COMPLETE.test(normalized)) return false;
  return parseDateString(normalized) != null;
}

/** Format parts as ASCII `YYYY-MM-DD` (canonical value format). */
export function toDateString(parts: DateParts): string {
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function formatDateParts(
  parts: DateParts,
  pattern: DatePattern = "YYYY-MM-DD",
  locale: Locale = "en",
): string {
  const y = String(parts.year);
  const m = pad2(parts.month);
  const d = pad2(parts.day);
  let out: string;
  switch (pattern) {
    case "YYYY/MM/DD":
      out = `${y}/${m}/${d}`;
      break;
    case "DD-MM-YYYY":
      out = `${d}-${m}-${y}`;
      break;
    case "DD/MM/YYYY":
      out = `${d}/${m}/${y}`;
      break;
    default:
      out = `${y}-${m}-${d}`;
  }
  return localizeDigits(out, locale);
}

/** Human-readable label, e.g. `15 Magh 2082` / `१५ माघ २०८२`. */
export function formatBsLabel(parts: DateParts, locale: Locale = "en"): string {
  const day = localizeDigits(parts.day, locale);
  const month = getMonthName(parts.month, locale);
  const year = localizeDigits(parts.year, locale);
  return `${day} ${month} ${year}`;
}
