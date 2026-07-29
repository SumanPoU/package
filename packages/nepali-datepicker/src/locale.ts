import type { Locale } from "./types";

/** Long / short label form for months and weekdays. */
export type LabelForm = "long" | "short";

export type LocaleNameSet = {
  readonly long: readonly string[];
  readonly short: readonly string[];
};

export type DateLabelOverrides = {
  months?: Partial<Record<Locale, Partial<LocaleNameSet>>>;
  weekdays?: Partial<Record<Locale, Partial<LocaleNameSet>>>;
};

/** English month names — long (calendar header) + short (compact grids). */
export const MONTH_NAMES_EN = {
  long: [
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
  ],
  short: [
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
  ],
} as const satisfies LocaleNameSet;

/** Nepali month names — full Devanagari + compact. */
export const MONTH_NAMES_NE = {
  long: [
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
  ],
  short: [
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
  ],
} as const satisfies LocaleNameSet;

export const WEEKDAY_LABELS_EN = {
  long: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
} as const satisfies LocaleNameSet;

export const WEEKDAY_LABELS_NE = {
  long: ["आइतवार", "सोमवार", "मंगलवार", "बुधवार", "बिहिवार", "शुक्रवार", "शनिवार"],
  short: ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"],
} as const satisfies LocaleNameSet;

/** @deprecated Prefer `MONTH_NAMES_EN.long` — kept for existing imports. */
export const NEPALI_MONTH_NAMES_EN = MONTH_NAMES_EN.long;
/** @deprecated Prefer `MONTH_NAMES_NE.long`. */
export const NEPALI_MONTH_NAMES_NE = MONTH_NAMES_NE.long;
/** @deprecated Prefer `WEEKDAY_LABELS_EN.short`. */
export const WEEKDAY_NAMES_EN = WEEKDAY_LABELS_EN.short;
/** @deprecated Prefer `WEEKDAY_LABELS_NE.short`. */
export const WEEKDAY_NAMES_NE = WEEKDAY_LABELS_NE.short;

const DIGITS_NE = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"] as const;

function pickSet(
  locale: Locale,
  kind: "months" | "weekdays",
  overrides?: DateLabelOverrides,
): LocaleNameSet {
  const base =
    kind === "months"
      ? locale === "ne"
        ? MONTH_NAMES_NE
        : MONTH_NAMES_EN
      : locale === "ne"
        ? WEEKDAY_LABELS_NE
        : WEEKDAY_LABELS_EN;
  const patch = overrides?.[kind]?.[locale];
  if (!patch) return base;
  return {
    long: patch.long ?? base.long,
    short: patch.short ?? base.short,
  };
}

export type LocaleHelpers = {
  getMonthName: (month: number, form?: LabelForm) => string;
  getMonthNames: (form?: LabelForm) => readonly string[];
  getWeekdayName: (weekday: number, form?: LabelForm) => string;
  getWeekdayNames: (form?: LabelForm) => readonly string[];
};

/**
 * Build locale helpers with optional label overrides.
 * `weekday` is 0 = Sunday … 6 = Saturday. `month` is 1–12 (Baisakh = 1).
 */
export function createLocaleHelpers(
  locale: Locale = "en",
  overrides?: DateLabelOverrides,
): LocaleHelpers {
  const months = pickSet(locale, "months", overrides);
  const weekdays = pickSet(locale, "weekdays", overrides);

  return {
    getMonthName(month, form = "long") {
      const idx = month - 1;
      if (idx < 0 || idx > 11) return String(month);
      return (form === "short" ? months.short : months.long)[idx]!;
    },
    getMonthNames(form = "long") {
      return form === "short" ? months.short : months.long;
    },
    getWeekdayName(weekday, form = "short") {
      if (weekday < 0 || weekday > 6) return String(weekday);
      return (form === "short" ? weekdays.short : weekdays.long)[weekday]!;
    },
    getWeekdayNames(form = "short") {
      return form === "short" ? weekdays.short : weekdays.long;
    },
  };
}

export function getMonthName(
  month: number,
  locale: Locale = "en",
  form: LabelForm = "long",
  overrides?: DateLabelOverrides,
): string {
  return createLocaleHelpers(locale, overrides).getMonthName(month, form);
}

export function getMonthNames(
  locale: Locale = "en",
  form: LabelForm = "long",
  overrides?: DateLabelOverrides,
): readonly string[] {
  return createLocaleHelpers(locale, overrides).getMonthNames(form);
}

export function getWeekdayNames(
  locale: Locale = "en",
  form: LabelForm = "short",
  overrides?: DateLabelOverrides,
): readonly string[] {
  return createLocaleHelpers(locale, overrides).getWeekdayNames(form);
}

export function getWeekdayName(
  weekday: number,
  locale: Locale = "en",
  form: LabelForm = "short",
  overrides?: DateLabelOverrides,
): string {
  return createLocaleHelpers(locale, overrides).getWeekdayName(weekday, form);
}

/** Map ASCII digits to Devanagari when locale is `ne`. */
export function localizeDigits(value: string | number, locale: Locale): string {
  const s = String(value);
  if (locale !== "ne") return s;
  return s.replace(/\d/g, (d) => DIGITS_NE[Number(d)]!);
}
