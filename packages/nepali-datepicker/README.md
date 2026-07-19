# @itzsa/nepali-datepicker

React **Nepali (Bikram Sambat)** date pickers — calendar select, **editable**
`YYYY-MM-DD` input, and **date range** — plus pure AD ↔ BS helpers.

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

```ts
import { adToBs, bsToAd, todayBs, diffBsDays } from "@itzsa/nepali-datepicker";

bsToAd(2080, 10, 15); // { year: 2024, month: 1, day: 29 }
adToBs(2025, 4, 14);  // { year: 2082, month: 1, day: 1 }
```

Calendar data: **BS 2000–2100**.

## Docs

https://itzsa.acharya-suman.com.np/nepali-datepicker

## License

MIT
