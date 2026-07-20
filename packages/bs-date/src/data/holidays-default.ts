/**
 * Sample / starter holiday calendar.
 *
 * Government and organizational holiday lists change every year.
 * Treat this as an extensible seed — override via `setHolidayCalendar`.
 *
 * @asOf 2026-07 — illustrative entries for common observances (not an
 * official gazette extract). Verify before payroll/legal use.
 */
import type { HolidayCalendar, HolidayEntry } from "../types";

/** Recurring national days (same BS month/day each year). */
const RECURRING: HolidayEntry[] = [
  {
    month: 1,
    day: 1,
    nameEn: "Nepali New Year",
    nameNe: "नयाँ वर्ष",
    kind: "national",
  },
  {
    month: 3,
    day: 15,
    nameEn: "Democracy Day",
    nameNe: "प्रजातन्त्र दिवस",
    kind: "national",
  },
  {
    month: 6,
    day: 3,
    nameEn: "Constitution Day",
    nameNe: "संविधान दिवस",
    kind: "national",
  },
];

/**
 * Fixed-year samples (Dashain/Tihar shift annually — these are examples only).
 * Replace with your org's published calendar each year.
 */
const FIXED_SAMPLES: HolidayEntry[] = [
  {
    year: 2082,
    month: 6,
    day: 10,
    nameEn: "Dashain (example)",
    nameNe: "दशैं (उदाहरण)",
    kind: "religious",
  },
  {
    year: 2082,
    month: 7,
    day: 15,
    nameEn: "Tihar (example)",
    nameNe: "तिहार (उदाहरण)",
    kind: "religious",
  },
];

export const DEFAULT_HOLIDAY_CALENDAR: HolidayCalendar = {
  asOf: "2026-07 (sample data — not an official gazette)",
  yearRange: { min: 2080, max: 2085 },
  entries: [...RECURRING, ...FIXED_SAMPLES],
};
