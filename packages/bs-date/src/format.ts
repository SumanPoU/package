import { BsInvalidError } from "./errors";
import type { BsDateInput, Locale } from "./types";
import { pad2, requireBsDate } from "./validate";

export const BS_MONTH_NAMES_EN = [
  "Baisakh",
  "Jestha",
  "Ashar",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const BS_MONTH_NAMES_NE = [
  "बैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कार्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फाल्गुन",
  "चैत",
] as const;

const DIGITS_NE = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const;

/** Convert Arabic digits to Devanagari (०–९). */
export function toNepaliNumerals(input: string | number): string {
  return String(input).replace(/\d/g, (d) => DIGITS_NE[Number(d)]!);
}

export function getBsMonthName(month: number, locale: Locale = "en"): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new BsInvalidError(`Month must be 1–12 (got ${month})`);
  }
  return locale === "ne"
    ? BS_MONTH_NAMES_NE[month - 1]!
    : BS_MONTH_NAMES_EN[month - 1]!;
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
  const monthLong = getBsMonthName(d.month, locale);
  const monthShort =
    locale === "ne" ? monthLong.slice(0, 2) : monthLong.slice(0, 3);

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
