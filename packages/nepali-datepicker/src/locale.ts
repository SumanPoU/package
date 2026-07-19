import type { Locale } from "./types";

export const NEPALI_MONTH_NAMES_EN = [
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

export const NEPALI_MONTH_NAMES_NE = [
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

export const WEEKDAY_NAMES_EN = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const WEEKDAY_NAMES_NE = [
  "आइत",
  "सोम",
  "मंगल",
  "बुध",
  "बिही",
  "शुक्र",
  "शनि",
] as const;

const DIGITS_NE = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const;

export function getMonthName(month: number, locale: Locale = "en"): string {
  const idx = month - 1;
  if (idx < 0 || idx > 11) return String(month);
  return locale === "ne"
    ? NEPALI_MONTH_NAMES_NE[idx]!
    : NEPALI_MONTH_NAMES_EN[idx]!;
}

export function getWeekdayNames(locale: Locale = "en"): readonly string[] {
  return locale === "ne" ? WEEKDAY_NAMES_NE : WEEKDAY_NAMES_EN;
}

/** Map ASCII digits to Devanagari when locale is `ne`. */
export function localizeDigits(value: string | number, locale: Locale): string {
  const s = String(value);
  if (locale !== "ne") return s;
  return s.replace(/\d/g, (d) => DIGITS_NE[Number(d)]!);
}
