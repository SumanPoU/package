export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const CONVERT_API: PropRow[] = [
  {
    name: "adToBs",
    type: "(input: AdDateInput) => BsDate",
    description: "AD civil date → BS. Accepts Date, YYYY-MM-DD, or { year, month, day }.",
  },
  {
    name: "bsToAd",
    type: "(input: BsDateInput) => Date",
    description: "BS → local-midnight Date for the matching AD civil day.",
  },
  {
    name: "bsToAdParts",
    type: "(input: BsDateInput) => AdDate",
    description: "BS → AD parts without constructing a Date.",
  },
  {
    name: "todayBs",
    type: "() => BsDate",
    description: "Current local calendar day as BS.",
  },
];

export const ARITHMETIC_API: PropRow[] = [
  {
    name: "addDays",
    type: "(input: BsDateInput, n: number) => BsDate",
    description: "Add or subtract whole days in BS space.",
  },
  {
    name: "addMonths",
    type: "(input: BsDateInput, n: number) => BsDate",
    description: "Add months; day is clamped to the target month length.",
  },
  {
    name: "addYears",
    type: "(input: BsDateInput, n: number) => BsDate",
    description: "Add years with day clamp (leap-month safe).",
  },
  {
    name: "diffInDays",
    type: "(a: BsDateInput, b: BsDateInput) => number",
    description: "Signed whole-day difference (a − b).",
  },
  {
    name: "diffInBsYears",
    type: "(a: BsDateInput, b: BsDateInput) => number",
    description: "Age/tenure style year count (anniversary not yet reached → floor).",
  },
];

export const CALENDAR_API: PropRow[] = [
  {
    name: "daysInBsMonth",
    type: "(year: number, month: number) => number",
    description: "Length of a BS month (1–12).",
  },
  {
    name: "startOfBsMonth / endOfBsMonth",
    type: "(input: BsDateInput) => BsDate",
    description: "First / last day of the month.",
  },
  {
    name: "getBsWeekday",
    type: "(input: BsDateInput) => number",
    description: "0 = Sunday … 6 = Saturday (UTC civil day).",
  },
  {
    name: "isSaturday",
    type: "(input: BsDateInput) => boolean",
    description: "Nepal weekend helper.",
  },
  {
    name: "compareBs",
    type: "(a, b) => -1 | 0 | 1",
    description: "Chronological compare of two BS dates.",
  },
];

export const FORMAT_API: PropRow[] = [
  {
    name: "formatBs",
    type: '(date, pattern?, { locale?, nepaliDigits? }) => string',
    default: '"YYYY-MM-DD"',
    description: "Tokens: YYYY, MM, DD, MMMM, MMM. locale ne uses Devanagari month names.",
  },
  {
    name: "formatBsIso",
    type: "(input) => string",
    description: "Always YYYY-MM-DD with ASCII digits.",
  },
  {
    name: "toNepaliNumerals",
    type: "(input: string | number) => string",
    description: "Map 0–9 → ०–९.",
  },
  {
    name: "getBsMonthName",
    type: '(month: number, locale?: "en" | "ne") => string',
    description: "Baisakh…Chaitra / बैशाख…चैत्र.",
  },
];

export const HOLIDAY_API: PropRow[] = [
  {
    name: "isPublicHoliday",
    type: "(input: BsDateInput) => boolean",
    description: "True if the active calendar marks the date.",
  },
  {
    name: "getHolidayName",
    type: '(input, locale?) => string | null',
    description: "First matching holiday name, or null.",
  },
  {
    name: "getHolidaysInMonth",
    type: "(year, month) => HolidayEntry[]",
    description: "All entries matching that year/month (O(1) index).",
  },
  {
    name: "setHolidayCalendar",
    type: "(calendar: HolidayCalendar) => void",
    description: "Replace the process-global holiday set (module API).",
  },
  {
    name: "extendHolidayCalendar",
    type: "(entries: HolidayEntry[]) => void",
    description: "Append entries to the active calendar.",
  },
  {
    name: "createHolidayLookup",
    type: "(calendar) => HolidayLookup",
    description: "Build an indexed lookup without touching global state.",
  },
  {
    name: "mergeHolidayCalendars",
    type: "(...calendars) => HolidayCalendar",
    description: "Merge multiple calendars (later entries win on same key).",
  },
];

export const ENGINE_API: PropRow[] = [
  {
    name: "createBsDateEngine",
    type: "(options?: BsDateEngineOptions) => BsDateEngine",
    description:
      "Isolated convert / arithmetic / holidays — safe for workers & multi-tenant servers.",
  },
  {
    name: "DEFAULT_CALENDAR_DATA",
    type: "BsCalendarData",
    description: "Bundled Panchanga tables BS 2000–2100.",
  },
  {
    name: "extendCalendarData",
    type: "(base, extra, patch?) => BsCalendarData",
    description: "Merge extra year→month-length rows (e.g. past 2100).",
  },
  {
    name: "getCalendarMeta",
    type: "(calendar?) => { minYear, maxYear, yearCount, … }",
    description: "Inspect range / version / epoch without converting.",
  },
];

export const VALIDATE_API: PropRow[] = [
  {
    name: "isValidBsDate",
    type: "(input: unknown) => boolean",
    description: "Soft check against the default calendar.",
  },
  {
    name: "assertValidBsDate / requireBsDate",
    type: "…",
    description: "Throw typed BsRangeError / BsInvalidError / BsParseError.",
  },
  {
    name: "parseDateString",
    type: "(input: string) => AdDate",
    description: "Parse YYYY-MM-DD (AD or BS string shape).",
  },
];
