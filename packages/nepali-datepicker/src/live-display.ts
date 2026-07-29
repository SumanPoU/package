import { getBsWeekday } from "./convert";
import {
  createLocaleHelpers,
  type DateLabelOverrides,
  localizeDigits,
} from "./locale";
import type { DateTimeParts, Locale } from "./types";

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Preset display formats matching common Nepali live clock widgets. */
export type NepaliDateTimeDisplayFormat =
  /** नेपाली समय HH : MM PERIOD ¶ वि सं YYYY MONTH DD WEEKDAY */
  | "time-date-two-line"
  /** Same as two-line with seconds. */
  | "time-date-two-line-seconds"
  /** Single line: time + वि सं date (no weekday). */
  | "time-date-single"
  /** Single line: time + date + weekday (no वि सं). */
  | "time-date-single-no-bs"
  /** Time only with prefix. */
  | "time-only"
  /** वि सं YYYY MONTH DD WEEKDAY */
  | "date-only"
  /** DD MONTH YYYY, WEEKDAY */
  | "dmyw"
  /** YYYY MONTH DD WEEKDAY (no वि सं). */
  | "date-only-no-bs"
  /** HH : MM : SS PERIOD YYYY MONTH DD WEEKDAY (no prefixes). */
  | "time-date-bare";

export type NepaliDateTimeDisplayOptions = {
  locale?: Locale;
  /** 12-hour clock (default `true` for Nepali-style widgets). */
  hour12?: boolean;
  /** Force seconds on/off; otherwise derived from the format preset. */
  withSeconds?: boolean;
  /** Prefix before time. Default: नेपाली समय / Nepali time. Pass `false` to hide. */
  timePrefix?: string | false;
  /** Prefix before BS year. Default: वि सं / B.S. Pass `false` to hide. */
  bsPrefix?: string | false;
  /**
   * Show AM/PM (or पूर्वाह्न/मध्यान्ह) after the clock.
   * Default `true`. Pass `false` to show digits only.
   */
  showPeriod?: boolean;
  /** Separator between time digits. Default `" : "`. */
  timeSeparator?: string;
  /** AM / PM (or पूर्वाह्न / मध्यान्ह) labels. */
  periodLabels?: { am: string; pm: string };
  labels?: DateLabelOverrides;
};

export type FormattedNepaliDateTime = {
  /** Full string (lines joined with `\n` when multi-line). */
  text: string;
  /** Individual lines for multi-line layouts. */
  lines: string[];
  /** True when the preset is intended as two stacked lines. */
  multiline: boolean;
};

function defaultPeriodLabels(locale: Locale): { am: string; pm: string } {
  // Match common Nepali live clocks (PM often shown as मध्यान्ह).
  return locale === "ne"
    ? { am: "पूर्वाह्न", pm: "मध्यान्ह" }
    : { am: "AM", pm: "PM" };
}

function defaultTimePrefix(locale: Locale): string {
  return locale === "ne" ? "नेपाली समय" : "Nepali time";
}

function defaultBsPrefix(locale: Locale): string {
  return locale === "ne" ? "वि सं" : "B.S.";
}

function formatNeedsSeconds(format: NepaliDateTimeDisplayFormat): boolean {
  return (
    format === "time-date-two-line-seconds" ||
    format === "time-date-single" ||
    format === "time-date-single-no-bs" ||
    format === "time-only" ||
    format === "time-date-bare"
  );
}

function isMultiline(format: NepaliDateTimeDisplayFormat): boolean {
  return (
    format === "time-date-two-line" || format === "time-date-two-line-seconds"
  );
}

function formatTimeParts(
  parts: DateTimeParts,
  locale: Locale,
  opts: {
    hour12: boolean;
    withSeconds: boolean;
    separator: string;
    period: { am: string; pm: string };
  },
): { clock: string; period: string } {
  let hour = parts.hour;
  let period = opts.period.am;
  if (opts.hour12) {
    period = hour >= 12 ? opts.period.pm : opts.period.am;
    hour = hour % 12;
    if (hour === 0) hour = 12;
  }
  const h = localizeDigits(pad2(hour), locale);
  const m = localizeDigits(pad2(parts.minute), locale);
  const sep = opts.separator;
  if (opts.withSeconds) {
    const s = localizeDigits(pad2(parts.second ?? 0), locale);
    return { clock: `${h}${sep}${m}${sep}${s}`, period };
  }
  return { clock: `${h}${sep}${m}`, period };
}

function formatDateCore(
  parts: DateTimeParts,
  locale: Locale,
  labels: DateLabelOverrides | undefined,
  kind: "ymd" | "dmy" | "ymd-weekday" | "dmyw",
): string {
  const loc = createLocaleHelpers(locale, labels);
  const year = localizeDigits(parts.year, locale);
  const day = localizeDigits(parts.day, locale);
  const month = loc.getMonthName(parts.month, "long");
  const weekday = loc.getWeekdayName(
    getBsWeekday(parts.year, parts.month, parts.day),
    "long",
  );

  switch (kind) {
    case "ymd":
      return `${year} ${month} ${day}`;
    case "dmy":
      return `${day} ${month} ${year}`;
    case "ymd-weekday":
      return `${year} ${month} ${day} ${weekday}`;
    case "dmyw":
      return `${day} ${month} ${year}, ${weekday}`;
  }
}

/**
 * Format a BS datetime into one of the Nepali live-clock presets.
 * Value stays ASCII internally; this is display-only.
 */
export function formatNepaliDateTimeDisplay(
  parts: DateTimeParts,
  format: NepaliDateTimeDisplayFormat = "time-date-two-line",
  options: NepaliDateTimeDisplayOptions = {},
): FormattedNepaliDateTime {
  const locale = options.locale ?? "ne";
  const hour12 = options.hour12 ?? true;
  const withSeconds = options.withSeconds ?? formatNeedsSeconds(format);
  const separator = options.timeSeparator ?? " : ";
  const period = options.periodLabels ?? defaultPeriodLabels(locale);
  const timePrefix =
    options.timePrefix === false
      ? ""
      : (options.timePrefix ?? defaultTimePrefix(locale));
  const bsPrefix =
    options.bsPrefix === false
      ? ""
      : (options.bsPrefix ?? defaultBsPrefix(locale));

  const { clock, period: periodLabel } = formatTimeParts(parts, locale, {
    hour12,
    withSeconds,
    separator,
    period,
  });

  const showPeriod = options.showPeriod !== false;
  const timeBlock = [timePrefix, clock, showPeriod ? periodLabel : ""]
    .filter(Boolean)
    .join(" ");

  const dateYmd = formatDateCore(parts, locale, options.labels, "ymd");
  const dateYmdWd = formatDateCore(
    parts,
    locale,
    options.labels,
    "ymd-weekday",
  );
  const dateDmyw = formatDateCore(parts, locale, options.labels, "dmyw");
  const bsDate = [bsPrefix, dateYmdWd].filter(Boolean).join(" ");
  const bsDateNoWd = [bsPrefix, dateYmd].filter(Boolean).join(" ");

  let lines: string[];
  switch (format) {
    case "time-date-two-line":
    case "time-date-two-line-seconds":
      lines = [timeBlock, bsDate];
      break;
    case "time-date-single":
      lines = [`${timeBlock} ${bsDateNoWd}`];
      break;
    case "time-date-single-no-bs":
      lines = [`${timeBlock} ${dateYmdWd}`];
      break;
    case "time-only":
      lines = [timeBlock];
      break;
    case "date-only":
      lines = [bsDate];
      break;
    case "dmyw":
      lines = [dateDmyw];
      break;
    case "date-only-no-bs":
      lines = [dateYmdWd];
      break;
    case "time-date-bare":
      lines = [
        [clock, showPeriod ? periodLabel : "", dateYmdWd]
          .filter(Boolean)
          .join(" "),
      ];
      break;
    default:
      lines = [timeBlock, bsDate];
  }

  return {
    text: lines.join("\n"),
    lines,
    multiline: isMultiline(format),
  };
}

/** All built-in display format ids (useful for docs / pickers). */
export const NEPALI_DATETIME_DISPLAY_FORMATS: readonly NepaliDateTimeDisplayFormat[] =
  [
    "time-date-two-line",
    "time-date-two-line-seconds",
    "time-date-single",
    "time-date-single-no-bs",
    "time-only",
    "date-only",
    "dmyw",
    "date-only-no-bs",
    "time-date-bare",
  ] as const;
