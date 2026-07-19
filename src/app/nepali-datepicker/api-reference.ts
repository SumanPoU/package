export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const PICKER_PROPS: PropRow[] = [
  {
    name: "value",
    type: "string",
    description: "Controlled BS date as ASCII YYYY-MM-DD. Empty string = no selection.",
  },
  {
    name: "defaultValue",
    type: "string",
    default: '""',
    description: "Uncontrolled initial BS date.",
  },
  {
    name: "onChange",
    type: "(value: string) => void",
    description: "Fires with canonical YYYY-MM-DD (or \"\" when cleared).",
  },
  {
    name: "onSelect",
    type: "(value: string) => void",
    description: "Fires when a day is chosen (also on Today / Clear).",
  },
  {
    name: "locale",
    type: "'ne' | 'en'",
    default: "'ne'",
    description: "Calendar month/weekday names and day digits.",
  },
  {
    name: "valueLocale",
    type: "'ne' | 'en'",
    description: "Input display locale. Defaults to locale.",
  },
  {
    name: "minDate / maxDate",
    type: "string",
    description: "Inclusive selectable range as YYYY-MM-DD (BS).",
  },
  {
    name: "minYear / maxYear",
    type: "number",
    default: "2000 / 2100",
    description: "Year picker bounds within supported calendar data.",
  },
  {
    name: "closeOnSelect",
    type: "boolean",
    default: "true",
    description: "Close the popover after picking a day.",
  },
  {
    name: "todayIfEmpty",
    type: "boolean",
    default: "true",
    description: "Open on today’s month when value is empty.",
  },
  {
    name: "disabled / readOnly",
    type: "boolean",
    default: "false",
    description: "Disable interaction or prevent opening.",
  },
  {
    name: "className / inputClassName / popoverClassName",
    type: "string",
    description: "Style hooks for root, input, and popover.",
  },
  {
    name: "classNames",
    type: "NepaliDatePickerClassNames",
    description:
      "Per-part classes: root, field, input, trigger, popover, day, footer.",
  },
  {
    name: "vars",
    type: "NepaliDatePickerVars",
    description:
      "Theme tokens: accent, background, border, surface, radius, font, …",
  },
  {
    name: "style / popoverStyle",
    type: "CSSProperties",
    description: "Inline styles merged with vars on root / popover.",
  },
];

export const EDITABLE_PROPS: PropRow[] = [
  {
    name: "value",
    type: "string",
    description:
      "Controlled string — may be partial while typing (e.g. 2082-04).",
  },
  {
    name: "onChange",
    type: "(value: string) => void",
    description: "Fires on each keystroke (masked) and on calendar pick.",
  },
  {
    name: "locale",
    type: "'ne' | 'en'",
    default: "'en'",
    description: "Calendar UI locale (input stays ASCII YYYY-MM-DD).",
  },
  {
    name: "minDate / maxDate / minYear / maxYear",
    type: "…",
    description: "Same bounds as NepaliDatePicker.",
  },
  {
    name: "placeholder",
    type: "string",
    default: "'YYYY-MM-DD'",
    description: "Shown when the field is empty.",
  },
  {
    name: "classNames / vars / style",
    type: "…",
    description: "Same styling API as NepaliDatePicker.",
  },
];

export const RANGE_PROPS: PropRow[] = [
  {
    name: "value",
    type: "{ from?: string; to?: string }",
    description: "Controlled BS range (ASCII YYYY-MM-DD each).",
  },
  {
    name: "onChange",
    type: "(range) => void",
    description: "Fires as the user selects start / end.",
  },
  {
    name: "numberOfMonths",
    type: "1 | 2",
    default: "2",
    description: "Show one or two months side by side.",
  },
  {
    name: "locale / valueLocale",
    type: "'ne' | 'en'",
    default: "'ne'",
    description: "Calendar and trigger label locales.",
  },
  {
    name: "minDate / maxDate",
    type: "string",
    description: "Inclusive selectable bounds.",
  },
  {
    name: "closeOnSelect",
    type: "boolean",
    default: "true",
    description: "Close after both ends are chosen.",
  },
  {
    name: "classNames / vars / style",
    type: "…",
    description:
      "Styling API plus rangeTrigger, rangeLabel, rangeMonths in classNames.",
  },
];

export const HELPER_API: PropRow[] = [
  {
    name: "bsToAd(y, m, d)",
    type: "DateParts",
    description: "Convert BS → AD civil date parts.",
  },
  {
    name: "adToBs(y, m, d)",
    type: "DateParts",
    description: "Convert AD → BS date parts.",
  },
  {
    name: "todayBs()",
    type: "DateParts",
    description: "Today in BS (local civil date).",
  },
  {
    name: "parseDateString / toDateString",
    type: "…",
    description: "Parse/format ASCII YYYY-MM-DD BS strings.",
  },
  {
    name: "formatTypedBsDate / isCompleteBsDate",
    type: "…",
    description: "Mask typing and validate a complete BS date.",
  },
  {
    name: "diffBsDays / addBsDays",
    type: "…",
    description: "Day arithmetic across the BS calendar.",
  },
  {
    name: "validateBsDate / assertValidBsDate",
    type: "ValidationResult | void",
    description:
      "Soft or hard validation (year/month/day range + calendar-valid).",
  },
  {
    name: "isValidBsDate / isCompleteBsDate",
    type: "boolean",
    description: "Quick checks for parts or YYYY-MM-DD strings.",
  },
  {
    name: "formatBsLabel(parts, locale)",
    type: "string",
    description: "Human label, e.g. १५ माघ २०८२.",
  },
];
