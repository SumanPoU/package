import { BsInvalidError } from "./errors";
import type { BsDateInput, Locale } from "./types";
import { pad2, requireBsDate } from "./validate";

export type LabelForm = "long" | "short";

export const BS_MONTH_NAMES_EN = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashoj",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const BS_MONTH_NAMES_EN_SHORT = [
  "Bai",
  "Jes",
  "Ash",
  "Shr",
  "Bha",
  "Aso",
  "Kar",
  "Man",
  "Pou",
  "Mag",
  "Fal",
  "Cha",
] as const;

export const BS_MONTH_NAMES_NE = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
] as const;

export const BS_MONTH_NAMES_NE_SHORT = [
  "बैशा",
  "जेठ",
  "असार",
  "श्राव",
  "भदौ",
  "असोज",
  "कार्",
  "मंसि",
  "पुष",
  "माघ",
  "फाल्",
  "चैत",
] as const;

export const BS_WEEKDAY_NAMES_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const BS_WEEKDAY_NAMES_EN_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const BS_WEEKDAY_NAMES_NE = [
  "आइतवार",
  "सोमवार",
  "मंगलवार",
  "बुधवार",
  "बिहिवार",
  "शुक्रवार",
  "शनिवार",
] as const;

export const BS_WEEKDAY_NAMES_NE_SHORT = [
  "आइत",
  "सोम",
  "मंगल",
  "बुध",
  "बिही",
  "शुक्र",
  "शनि",
] as const;

const DIGITS_NE = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const;

/** Convert Arabic digits to Devanagari (०–९). */
export function toNepaliNumerals(input: string | number): string {
  return String(input).replace(/\d/g, (d) => DIGITS_NE[Number(d)]!);
}

export function getBsMonthName(
  month: number,
  locale: Locale = "en",
  form: LabelForm = "long",
): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new BsInvalidError(`Month must be 1–12 (got ${month})`);
  }
  if (locale === "ne") {
    return form === "short"
      ? BS_MONTH_NAMES_NE_SHORT[month - 1]!
      : BS_MONTH_NAMES_NE[month - 1]!;
  }
  return form === "short"
    ? BS_MONTH_NAMES_EN_SHORT[month - 1]!
    : BS_MONTH_NAMES_EN[month - 1]!;
}

/** `weekday` is 0 = Sunday … 6 = Saturday. */
export function getBsWeekdayName(
  weekday: number,
  locale: Locale = "en",
  form: LabelForm = "short",
): string {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) {
    throw new BsInvalidError(`Weekday must be 0–6 (got ${weekday})`);
  }
  if (locale === "ne") {
    return form === "short"
      ? BS_WEEKDAY_NAMES_NE_SHORT[weekday]!
      : BS_WEEKDAY_NAMES_NE[weekday]!;
  }
  return form === "short"
    ? BS_WEEKDAY_NAMES_EN_SHORT[weekday]!
    : BS_WEEKDAY_NAMES_EN[weekday]!;
}

/**
 * Format a BS date.
 *
 * Tokens (longest match): `YYYY` `YY` `MMMM` `MMM` `MM` `M` `DD` `D`
 *
 * @example
 * formatBs(d, "YYYY-MM-DD")
 * formatBs(d, "DD MMMM YYYY", { locale: "ne" })
 * formatBs(d, "YYYY-MM-DD", { nepaliDigits: true })
 */
export function formatBs(
  input: BsDateInput,
  pattern = "YYYY-MM-DD",
  options?: { locale?: Locale; nepaliDigits?: boolean },
): string {
  const d = requireBsDate(input);
  const locale = options?.locale ?? "en";
  const monthLong = getBsMonthName(d.month, locale, "long");
  const monthShort = getBsMonthName(d.month, locale, "short");

  let out = pattern.replace(/YYYY|YY|MMMM|MMM|MM|DD|M|D/g, (token) => {
    switch (token) {
      case "YYYY":
        return String(d.year);
      case "YY":
        return String(d.year).slice(-2);
      case "MMMM":
        return monthLong;
      case "MMM":
        return monthShort;
      case "MM":
        return pad2(d.month);
      case "M":
        return String(d.month);
      case "DD":
        return pad2(d.day);
      case "D":
        return String(d.day);
      default:
        return token;
    }
  });

  if (options?.nepaliDigits) {
    out = toNepaliNumerals(out);
  }

  return out;
}

/** Convenience ISO-like `YYYY-MM-DD`. */
export function formatBsIso(input: BsDateInput): string {
  return formatBs(input, "YYYY-MM-DD");
}
