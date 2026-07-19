import { BS_MAX_YEAR, BS_MIN_YEAR, isValidBsDate } from "./convert";
import type { DateParts } from "./types";

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: ValidationCode; message: string };

export type ValidationCode =
  | "required"
  | "type"
  | "year_range"
  | "month_range"
  | "day_range"
  | "invalid_date";

/** Assert BS year is an integer in the supported table range. */
export function assertBsYear(year: number): void {
  if (typeof year !== "number" || !Number.isInteger(year)) {
    throw new TypeError("bsYear must be an integer");
  }
  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) {
    throw new RangeError(
      `bsYear must be between ${BS_MIN_YEAR} and ${BS_MAX_YEAR} (got ${year})`,
    );
  }
}

export function assertBsMonth(month: number): void {
  if (typeof month !== "number" || !Number.isInteger(month)) {
    throw new TypeError("bsMonth must be an integer");
  }
  if (month < 1 || month > 12) {
    throw new RangeError(`bsMonth must be 1–12 (got ${month})`);
  }
}

export function assertBsDay(day: number): void {
  if (typeof day !== "number" || !Number.isInteger(day)) {
    throw new TypeError("bsDay must be an integer");
  }
  if (day < 1 || day > 32) {
    throw new RangeError(`bsDay must be 1–32 (got ${day})`);
  }
}

/**
 * Soft validation (no throw). Use in forms before submit.
 * Equivalent purpose to the jQuery plugin checks — without its compressed calendar codec.
 */
export function validateBsDate(
  year: number,
  month: number,
  day: number,
): ValidationResult {
  if (year == null || month == null || day == null) {
    return {
      ok: false,
      code: "required",
      message: "year, month, and day are required",
    };
  }
  if (
    typeof year !== "number" ||
    typeof month !== "number" ||
    typeof day !== "number" ||
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return {
      ok: false,
      code: "type",
      message: "year, month, and day must be integers",
    };
  }
  if (year < BS_MIN_YEAR || year > BS_MAX_YEAR) {
    return {
      ok: false,
      code: "year_range",
      message: `year must be ${BS_MIN_YEAR}–${BS_MAX_YEAR}`,
    };
  }
  if (month < 1 || month > 12) {
    return {
      ok: false,
      code: "month_range",
      message: "month must be 1–12",
    };
  }
  if (day < 1 || day > 32) {
    return {
      ok: false,
      code: "day_range",
      message: "day must be 1–32",
    };
  }
  if (!isValidBsDate(year, month, day)) {
    return {
      ok: false,
      code: "invalid_date",
      message: `invalid BS date ${year}-${month}-${day}`,
    };
  }
  return { ok: true };
}

export function validateBsDateParts(parts: DateParts): ValidationResult {
  return validateBsDate(parts.year, parts.month, parts.day);
}

/** Throw if invalid — mirrors jQuery plugin hard checks. */
export function assertValidBsDate(
  year: number,
  month: number,
  day: number,
): void {
  const result = validateBsDate(year, month, day);
  if (!result.ok) {
    if (result.code === "type" || result.code === "required") {
      throw new TypeError(result.message);
    }
    throw new RangeError(result.message);
  }
}
