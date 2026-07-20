# @itzsa/nepali-datepicker

React **Nepali (Bikram Sambat)** date pickers — calendar select, **editable**
`YYYY-MM-DD` input, and **date range** — plus pure AD ↔ BS helpers.

For headless convert / arithmetic / holidays without UI, use
[`@itzsa/bs-date`](../bs-date) ([docs](https://itzsa.acharya-suman.com.np/bs-date)).

## Install

```bash
pnpm add @itzsa/nepali-datepicker
```

```css
@import "@itzsa/nepali-datepicker/styles.css";
```

## Components

### Calendar picker

```tsx
import { NepaliDatePicker } from "@itzsa/nepali-datepicker";

<NepaliDatePicker value={date} onChange={setDate} locale="ne" />
```

### Editable input (type + calendar)

```tsx
import { EditableNepaliDatePicker, isCompleteBsDate } from "@itzsa/nepali-datepicker";

<EditableNepaliDatePicker value={date} onChange={setDate} placeholder="YYYY-MM-DD" />
```

Digits are auto-masked to `YYYY-MM-DD`. Use `isCompleteBsDate(value)` before submit.

### Date & time

```tsx
import { NepaliDateTimePicker } from "@itzsa/nepali-datepicker";

<NepaliDateTimePicker
  value={dateTime}
  onChange={setDateTime}
  placeholder="मिति र समय"
  minDateTime="2080-01-01 00:00"
  maxDateTime="2090-12-30 23:59"
  minuteStep={5}
/>
```

Canonical value: `YYYY-MM-DD HH:mm` (optional seconds with `withSeconds`).

### Date range

```tsx
import { NepaliDateRangePicker } from "@itzsa/nepali-datepicker";

<NepaliDateRangePicker
  value={range}
  onChange={setRange}
  numberOfMonths={2}
  locale="ne"
/>
```

`value` is `{ from?: string; to?: string }` (ASCII BS dates).

## Helpers

AD ↔ BS conversion is powered by [`@itzsa/bs-date`](../bs-date)
([docs](https://itzsa.acharya-suman.com.np/bs-date)). The datepicker keeps the
familiar `(year, month, day) → DateParts` API:

```ts
import { adToBs, bsToAd, todayBs, diffBsDays } from "@itzsa/nepali-datepicker";

bsToAd(2080, 10, 15); // { year: 2024, month: 1, day: 29 }
adToBs(2025, 4, 14);  // { year: 2082, month: 1, day: 1 }
```

For headless apps (no React), depend on `@itzsa/bs-date` directly.

Calendar data: **BS 2000–2100** (shared with `@itzsa/bs-date`).

## Styling via props

```tsx
<NepaliDatePicker
  value={date}
  onChange={setDate}
  vars={{ accent: "#0f766e", radius: "12px" }}
  classNames={{ input: "h-10", popover: "shadow-lg" }}
/>
```

## Validation

```ts
import { validateBsDate, isCompleteBsDate } from "@itzsa/nepali-datepicker";

validateBsDate(2082, 1, 15); // { ok: true }
isCompleteBsDate("2082-04"); // false — still typing
```

You do **not** need the jQuery plugin’s compressed calendar codec — month
lengths and AD↔BS come from `@itzsa/bs-date`.

## Docs

https://itzsa.acharya-suman.com.np/nepali-datepicker

## License

MIT
