export type { DateParts, DatePattern, Locale } from "./types";

export type { BsDateRange } from "./nepali-date-range-picker";

export {
  BS_EPOCH_AD,
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  BS_MONTH_DAYS,
  adToBs,
  addBsDays,
  addBsMonths,
  bsToAd,
  clampBsDate,
  compareDateParts,
  diffBsDays,
  getBsWeekday,
  getDaysInBsMonth,
  getDaysInBsYear,
  isValidBsDate,
  todayBs,
} from "./convert";

export {
  formatBsLabel,
  formatDateParts,
  formatTypedBsDate,
  isCompleteBsDate,
  parseDateString,
  toDateString,
} from "./format";

export {
  getMonthName,
  getWeekdayNames,
  localizeDigits,
  NEPALI_MONTH_NAMES_EN,
  NEPALI_MONTH_NAMES_NE,
  WEEKDAY_NAMES_EN,
  WEEKDAY_NAMES_NE,
} from "./locale";

export type { NepaliDatePickerProps } from "./nepali-datepicker";
export { NepaliDatePicker } from "./nepali-datepicker";

export type { EditableNepaliDatePickerProps } from "./editable-nepali-datepicker";
export { EditableNepaliDatePicker } from "./editable-nepali-datepicker";

export type { NepaliDateRangePickerProps } from "./nepali-date-range-picker";
export { NepaliDateRangePicker } from "./nepali-date-range-picker";

export { cn, mergeRefs } from "./lib/utils";
