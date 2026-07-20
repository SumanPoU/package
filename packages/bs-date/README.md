# @itzsa/bs-date

**Headless** Bikram Sambat (Nepali) date logic — convert, arithmetic, format, and
swappable holidays. **No React, no CSS, no picker UI.**

Companion to [`@itzsa/nepali-datepicker`](../nepali-datepicker) (UI) and the rest
of the `@itzsa` ecosystem.

**Docs:** https://itzsa.acharya-suman.com.np/bs-date

## Install

```bash
pnpm add @itzsa/bs-date
```

## Quick start

```ts
import {
  adToBs,
  bsToAd,
  addDays,
  addMonths,
  diffInBsYears,
  formatBs,
  toNepaliNumerals,
  isPublicHoliday,
  setHolidayCalendar,
} from "@itzsa/bs-date";

adToBs(new Date(2025, 3, 14)); // → { year: 2082, month: 1, day: 1 }
bsToAd("2080-10-15"); // → Date for 2024-01-29 (local midnight)

addDays("2082-01-30", 5);
addMonths("2082-01-32", 1); // day clamped to next month's length
diffInBsYears("2070-05-15", "2080-05-14"); // → 9 (anniversary not reached)

formatBs("2082-01-05", "DD MMMM YYYY", { locale: "ne" });
toNepaliNumerals(2082); // → "२०८२"

isPublicHoliday("2082-01-01");
```

## Engine (robust / scalable)

Module helpers share one default calendar and a **process-global** holiday set.
For multi-tenant servers, workers, or tests that must not leak holiday state, use
an isolated engine:

```ts
import {
  createBsDateEngine,
  extendCalendarData,
  DEFAULT_CALENDAR_DATA,
} from "@itzsa/bs-date";

const payroll = createBsDateEngine({
  holidays: {
    asOf: "org-2082",
    yearRange: { min: 2082, max: 2082 },
    entries: [
      { year: 2082, month: 6, day: 12, nameEn: "Dashain", nameNe: "दशैं" },
    ],
  },
});

payroll.isPublicHoliday("2082-06-12");
payroll.adToBs("2025-04-14");

// Extend month-length tables past the bundled max year
const wider = extendCalendarData(DEFAULT_CALENDAR_DATA, {
  2101: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
});
const future = createBsDateEngine({ calendar: wider });
```

Holiday lookups are **indexed** (`createHolidayLookup`) so month and day queries
stay O(1) as calendars grow.

## API groups

### Convert
- `adToBs(Date | string | AdDate): BsDate`
- `bsToAd(BsDate | string): Date`
- `bsToAdParts(...)`, `todayBs()`

### Arithmetic
- `addDays` / `addMonths` / `addYears`
- `diffInDays` / `diffInBsYears` (age/tenure style)

### Calendar
- `daysInBsMonth`, `startOfBsMonth`, `endOfBsMonth`
- `getBsWeekday` (0 = Sunday … 6 = Saturday), `isSaturday`

### Format
- `formatBs(date, pattern, { locale?, nepaliDigits? })`
- `toNepaliNumerals`, `getBsMonthName`

### Holidays (swappable)
- `isPublicHoliday`, `getHolidayName`, `getHolidaysInMonth`
- `setHolidayCalendar` / `extendHolidayCalendar` / `resetHolidayCalendar`
- `createHolidayLookup` / `mergeHolidayCalendars`

### Engine / registry
- `createBsDateEngine(options?)`
- `DEFAULT_CALENDAR_DATA`, `extendCalendarData`, `getCalendarMeta`

### Validation
- `isValidBsDate`, typed errors: `BsRangeError`, `BsInvalidError`, `BsParseError`

## Known limitations / data currency

| Topic | Detail |
| --- | --- |
| **BS year range** | **2000–2100** (inclusive); extend with `extendCalendarData` |
| **Epoch** | BS `2000-01-01` ↔ AD `1943-04-14` |
| **Timezones** | Calendar-date math only (UTC civil day counting). `bsToAd` returns a local-midnight `Date` for the civil AD date — not a zoned instant |
| **Holidays** | Bundled list is **sample data** (`asOf: 2026-07`). Official gazettes change yearly; banks/gov/private orgs differ — **always** override with `setHolidayCalendar` or an engine for payroll |

### Updating holidays without a major bump

```ts
import { setHolidayCalendar, type HolidayCalendar } from "@itzsa/bs-date";

const org2082: HolidayCalendar = {
  asOf: "2082 org HR list",
  yearRange: { min: 2082, max: 2082 },
  entries: [
    { year: 2082, month: 6, day: 12, nameEn: "Dashain", nameNe: "दशैं", kind: "religious" },
    // …
  ],
};

setHolidayCalendar(org2082);
```

Recurring entries omit `year` and match every year on that month/day.

## Calendar data source

Month-length tables are ported from `@itzsa/nepali-datepicker` (`calendar-data.ts`),
attributed as community-verified Nepal Panchanga tables (MIT). Corrections welcome
via PR to this monorepo.

## License

MIT
