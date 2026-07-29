"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { createIsDisabledDay, SingleCalendarPanel } from "./calendar-panel";
import { BS_MAX_YEAR, BS_MIN_YEAR, todayBs, todayBsDateTime } from "./convert";
import {
  clampDateTime,
  compareDateTimeParts,
  dateTimeToDateParts,
  parseDateTimeBound,
  parseDateTimeString,
  snapMinute,
  toDateTimeString,
} from "./datetime";
import { formatBsDateTimeLabel } from "./format";
import { cn } from "./lib/utils";
import {
  formatNepaliDateTimeDisplay,
  type NepaliDateTimeDisplayFormat,
} from "./live-display";
import type { DateLabelOverrides, LabelForm } from "./locale";
import { localizeDigits } from "./locale";
import {
  CalendarIcon,
  useDismissOnOutside,
  useFloatingPopover,
  usePortalReady,
} from "./popover-utils";
import {
  mergePickerStyle,
  type NepaliDatePickerClassNames,
  type NepaliDatePickerVars,
} from "./styling";
import type { DateParts, DateTimeParts, Locale } from "./types";

export type NepaliDateTimePickerProps = {
  /** Controlled BS datetime `YYYY-MM-DD HH:mm` (ASCII). Empty = none. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  locale?: Locale;
  valueLocale?: Locale;
  monthFormat?: LabelForm;
  weekdayFormat?: LabelForm;
  monthPickerFormat?: LabelForm;
  labels?: DateLabelOverrides;
  /**
   * Minimum — date-only (`YYYY-MM-DD` → start of day) or full
   * `YYYY-MM-DD HH:mm`.
   */
  minDateTime?: string;
  /** Alias of `minDateTime` (date-only or datetime). */
  minDate?: string;
  /**
   * Maximum — date-only (`YYYY-MM-DD` → end of day) or full datetime.
   */
  maxDateTime?: string;
  /** Alias of `maxDateTime`. */
  maxDate?: string;
  minYear?: number;
  maxYear?: number;
  /**
   * Minute increment in the scroller. Default `1` (every minute).
   * Use `5` / `15` for coarser steps.
   */
  minuteStep?: number;
  /** Include seconds in value / UI. Default `false`. */
  withSeconds?: boolean;
  /**
   * How the closed input (and popover preview) render the selection.
   * Default `"time-date-single-no-bs"` for Nepali locale, else compact label.
   */
  displayFormat?: NepaliDateTimeDisplayFormat | "compact";
  /** Close after Confirm. Default `true`. */
  closeOnSelect?: boolean;
  todayIfEmpty?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
  classNames?: NepaliDatePickerClassNames;
  vars?: NepaliDatePickerVars;
  style?: React.CSSProperties;
  popoverStyle?: React.CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

function TimeColumn({
  label,
  values,
  selected,
  locale,
  disabledValues,
  onPick,
  formatValue,
  hideLabel,
}: {
  label: string;
  values: readonly (number | string)[];
  selected: number | string;
  locale: Locale;
  disabledValues?: Set<number | string>;
  onPick: (n: number | string) => void;
  formatValue?: (v: number | string) => string;
  hideLabel?: boolean;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>("[data-selected]");
    el?.scrollIntoView({ block: "center", inline: "nearest" });
  }, [selected]);

  return (
    <div className="itzsa-ndp-time-col">
      {hideLabel ? null : <p className="itzsa-ndp-time-col-label">{label}</p>}
      <div
        ref={listRef}
        className="itzsa-ndp-time-list"
        role="listbox"
        aria-label={label}
      >
        {values.map((n) => {
          const disabled = disabledValues?.has(n) ?? false;
          const isSel = n === selected;
          const text =
            formatValue?.(n) ??
            (typeof n === "number" ? localizeDigits(pad2(n), locale) : n);
          return (
            <button
              key={String(n)}
              type="button"
              role="option"
              aria-selected={isSel}
              data-selected={isSel ? "" : undefined}
              disabled={disabled}
              className={cn(
                "itzsa-ndp-time-item",
                isSel && "is-selected",
                disabled && "is-disabled",
              )}
              onClick={() => onPick(n)}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function hour24To12(hour: number): { hour12: number; period: "am" | "pm" } {
  const period = hour >= 12 ? "pm" : "am";
  const mod = hour % 12;
  return { hour12: mod === 0 ? 12 : mod, period };
}

function hour12To24(hour12: number, period: "am" | "pm"): number {
  if (period === "am") return hour12 === 12 ? 0 : hour12;
  return hour12 === 12 ? 12 : hour12 + 12;
}

/** Picker display: time + date, no "नेपाली समय" / period labels. */
function formatDisplay(
  parts: DateTimeParts,
  locale: Locale,
  displayFormat: NepaliDateTimeDisplayFormat | "compact",
  withSeconds: boolean,
  labels?: DateLabelOverrides,
): string {
  if (displayFormat === "compact") {
    return formatBsDateTimeLabel(parts, locale, { withSeconds });
  }
  return formatNepaliDateTimeDisplay(parts, displayFormat, {
    locale,
    withSeconds,
    labels,
    timePrefix: false,
    showPeriod: false,
  }).text.replace(/\n/g, " · ");
}

const HOURS_12 = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;
const PERIODS = ["am", "pm"] as const;

export const NepaliDateTimePicker = React.forwardRef<
  HTMLInputElement,
  NepaliDateTimePickerProps
>(function NepaliDateTimePicker(
  {
    value: valueProp,
    defaultValue = "",
    onChange,
    onSelect,
    locale = "ne",
    valueLocale,
    monthFormat = "long",
    weekdayFormat = "short",
    monthPickerFormat = "short",
    labels,
    minDateTime,
    minDate,
    maxDateTime,
    maxDate,
    minYear = BS_MIN_YEAR,
    maxYear = BS_MAX_YEAR,
    minuteStep = 1,
    withSeconds = false,
    displayFormat,
    closeOnSelect = true,
    todayIfEmpty = true,
    placeholder,
    disabled = false,
    readOnly = false,
    id,
    name,
    required,
    className,
    inputClassName,
    popoverClassName,
    classNames,
    vars,
    style,
    popoverStyle,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
  },
  forwardedRef,
) {
  const displayLocale = valueLocale ?? locale;
  const resolvedDisplayFormat: NepaliDateTimeDisplayFormat | "compact" =
    displayFormat ??
    (displayLocale === "ne" ? "time-date-single-no-bs" : "compact");
  const rootStyle = mergePickerStyle(vars, style);
  const panelStyle = mergePickerStyle(vars, popoverStyle);
  const step = Math.max(1, Math.min(30, Math.floor(minuteStep)));

  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? (valueProp ?? "") : uncontrolled;

  const minBound = React.useMemo(
    () => parseDateTimeBound(minDateTime ?? minDate, "min"),
    [minDateTime, minDate],
  );
  const maxBound = React.useMemo(
    () => parseDateTimeBound(maxDateTime ?? maxDate, "max"),
    [maxDateTime, maxDate],
  );

  const selected = React.useMemo(() => parseDateTimeString(value), [value]);
  const todayDate = React.useMemo(() => todayBs(), []);
  const nowDt = React.useMemo(() => todayBsDateTime(), []);

  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateTimeParts>(() =>
    clampDateTime(
      selected ??
        (todayIfEmpty ? nowDt : { ...nowDt, hour: 0, minute: 0, second: 0 }),
      minBound,
      maxBound,
    ),
  );
  const [view, setView] = React.useState({
    year: draft.year,
    month: draft.month,
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const portalReady = usePortalReady();
  const { pos } = useFloatingPopover(open, rootRef, {
    minWidth: 360,
    estimatedHeight: 460,
  });

  React.useImperativeHandle(
    forwardedRef,
    () => inputRef.current as HTMLInputElement,
  );

  React.useEffect(() => {
    if (!open) return;
    const base =
      selected ??
      (todayIfEmpty
        ? nowDt
        : { year: 2080, month: 1, day: 1, hour: 0, minute: 0, second: 0 });
    const next = clampDateTime(
      {
        ...base,
        minute: snapMinute(base.minute, step),
        second: withSeconds ? (base.second ?? 0) : 0,
      },
      minBound,
      maxBound,
    );
    setDraft(next);
    setView({ year: next.year, month: next.month });
  }, [
    open,
    maxBound,
    minBound,
    step,
    nowDt,
    selected,
    todayIfEmpty,
    withSeconds,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = React.useCallback(() => setOpen(false), []);
  useDismissOnOutside(open, close, [rootRef, popoverRef]);

  const commit = React.useCallback(
    (parts: DateTimeParts) => {
      const clamped = clampDateTime(parts, minBound, maxBound);
      const str = toDateTimeString(clamped, { withSeconds });
      if (!isControlled) setUncontrolled(str);
      onChange?.(str);
      onSelect?.(str);
      if (closeOnSelect) setOpen(false);
    },
    [
      minBound,
      maxBound,
      withSeconds,
      isControlled,
      onChange,
      onSelect,
      closeOnSelect,
    ],
  );

  const minParts = minBound ? dateTimeToDateParts(minBound) : null;
  const maxParts = maxBound ? dateTimeToDateParts(maxBound) : null;

  const isDisabledDay = React.useMemo(
    () => createIsDisabledDay({ minYear, maxYear, minParts, maxParts }),
    [minYear, maxYear, minParts, maxParts],
  );

  const setDraftClamped = (next: DateTimeParts) => {
    setDraft(clampDateTime(next, minBound, maxBound));
  };

  const onDayClick = (parts: DateParts) => {
    if (isDisabledDay(parts)) return;
    setDraftClamped({
      ...parts,
      hour: draft.hour,
      minute: draft.minute,
      second: draft.second ?? 0,
    });
  };

  const { hour12, period } = hour24To12(draft.hour);

  const minutes = React.useMemo(
    () => Array.from({ length: Math.floor(60 / step) }, (_, i) => i * step),
    [step],
  );
  const seconds = React.useMemo(
    () => Array.from({ length: 60 }, (_, i) => i),
    [],
  );

  const disabledHour12 = React.useMemo(() => {
    const set = new Set<number | string>();
    for (const h12 of HOURS_12) {
      const h24 = hour12To24(h12, period);
      const probe: DateTimeParts = {
        ...draft,
        hour: h24,
        minute: 0,
        second: 0,
      };
      const hi: DateTimeParts = {
        ...draft,
        hour: h24,
        minute: 59,
        second: 59,
      };
      if (minBound && compareDateTimeParts(hi, minBound) < 0) set.add(h12);
      if (maxBound && compareDateTimeParts(probe, maxBound) > 0) set.add(h12);
    }
    return set;
  }, [draft, minBound, maxBound, period]);

  const disabledMinutes = React.useMemo(() => {
    const set = new Set<number | string>();
    for (const m of minutes) {
      const probe: DateTimeParts = {
        ...draft,
        minute: m,
        second: 0,
      };
      const hi: DateTimeParts = {
        ...draft,
        minute: m,
        second: 59,
      };
      if (minBound && compareDateTimeParts(hi, minBound) < 0) set.add(m);
      if (maxBound && compareDateTimeParts(probe, maxBound) > 0) set.add(m);
    }
    return set;
  }, [draft, minBound, maxBound, minutes]);

  const disabledPeriods = React.useMemo(() => {
    const set = new Set<number | string>();
    for (const p of PERIODS) {
      const h24 = hour12To24(hour12, p);
      const probe: DateTimeParts = {
        ...draft,
        hour: h24,
        minute: 0,
        second: 0,
      };
      const hi: DateTimeParts = {
        ...draft,
        hour: h24,
        minute: 59,
        second: 59,
      };
      if (minBound && compareDateTimeParts(hi, minBound) < 0) set.add(p);
      if (maxBound && compareDateTimeParts(probe, maxBound) > 0) set.add(p);
    }
    return set;
  }, [draft, minBound, maxBound, hour12]);

  const displayValue = selected
    ? formatDisplay(
        selected,
        displayLocale,
        resolvedDisplayFormat,
        withSeconds,
        labels,
      )
    : "";

  const draftPreview = formatNepaliDateTimeDisplay(
    draft,
    withSeconds ? "time-date-two-line-seconds" : "time-date-two-line",
    {
      locale,
      labels,
      timePrefix: false,
      showPeriod: false,
      bsPrefix: false,
    },
  );

  const popover =
    open && portalReady
      ? createPortal(
          <div
            ref={popoverRef}
            className={cn(
              "itzsa-ndp-popover itzsa-ndp-popover-datetime",
              popoverClassName,
              classNames?.popover,
            )}
            data-locale={locale}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: Math.max(pos.width, withSeconds ? 440 : 400),
              zIndex: 50,
              ...panelStyle,
            }}
            role="dialog"
            aria-modal="false"
            aria-label="Nepali date and time"
          >
            <div className="itzsa-ndp-datetime-preview" aria-live="polite">
              {draftPreview.lines.map((line) => (
                <p key={line} className="itzsa-ndp-datetime-preview-line">
                  {line}
                </p>
              ))}
            </div>

            <div className="itzsa-ndp-datetime-layout">
              <div className="itzsa-ndp-datetime-calendar">
                <SingleCalendarPanel
                  locale={locale}
                  view={view}
                  onViewChange={setView}
                  selected={dateTimeToDateParts(draft)}
                  today={todayDate}
                  minYear={minYear}
                  maxYear={maxYear}
                  monthFormat={monthFormat}
                  weekdayFormat={weekdayFormat}
                  monthPickerFormat={monthPickerFormat}
                  labels={labels}
                  isDisabledDay={isDisabledDay}
                  onDayClick={onDayClick}
                />
              </div>

              <div className="itzsa-ndp-time-panel">
                <div
                  className={cn(
                    "itzsa-ndp-time-wheel",
                    withSeconds && "has-seconds",
                  )}
                >
                  <TimeColumn
                    label={locale === "ne" ? "घण्टा" : "Hour"}
                    hideLabel
                    values={HOURS_12}
                    selected={hour12}
                    locale={locale}
                    disabledValues={disabledHour12}
                    onPick={(h) =>
                      setDraftClamped({
                        ...draft,
                        hour: hour12To24(Number(h), period),
                      })
                    }
                  />
                  <TimeColumn
                    label={locale === "ne" ? "मिनेट" : "Min"}
                    hideLabel
                    values={minutes}
                    selected={snapMinute(draft.minute, step)}
                    locale={locale}
                    disabledValues={disabledMinutes}
                    onPick={(minute) =>
                      setDraftClamped({ ...draft, minute: Number(minute) })
                    }
                  />
                  {withSeconds ? (
                    <TimeColumn
                      label={locale === "ne" ? "सेकेन्ड" : "Sec"}
                      hideLabel
                      values={seconds}
                      selected={draft.second ?? 0}
                      locale={locale}
                      onPick={(second) =>
                        setDraftClamped({ ...draft, second: Number(second) })
                      }
                    />
                  ) : null}
                  <TimeColumn
                    label="AM/PM"
                    hideLabel
                    values={PERIODS}
                    selected={period}
                    locale={locale}
                    disabledValues={disabledPeriods}
                    formatValue={(v) => (v === "am" ? "AM" : "PM")}
                    onPick={(p) =>
                      setDraftClamped({
                        ...draft,
                        hour: hour12To24(hour12, p as "am" | "pm"),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className={cn("itzsa-ndp-footer", classNames?.footer)}>
              <button
                type="button"
                className="itzsa-ndp-footer-btn"
                onClick={() => {
                  const now = todayBsDateTime();
                  const t = clampDateTime(
                    {
                      ...now,
                      minute: snapMinute(now.minute, step),
                      second: withSeconds ? now.second : 0,
                    },
                    minBound,
                    maxBound,
                  );
                  setDraft(t);
                  setView({ year: t.year, month: t.month });
                }}
              >
                {locale === "ne" ? "अहिले" : "Now"}
              </button>
              <div className="itzsa-ndp-range-actions">
                {value ? (
                  <button
                    type="button"
                    className="itzsa-ndp-footer-btn"
                    onClick={() => {
                      if (!isControlled) setUncontrolled("");
                      onChange?.("");
                      onSelect?.("");
                    }}
                  >
                    {locale === "ne" ? "खाली" : "Clear"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="itzsa-ndp-footer-btn is-primary"
                  onClick={() => commit(draft)}
                >
                  {locale === "ne" ? "ठिक छ" : "Confirm"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "itzsa-ndp itzsa-ndp-datetime",
        className,
        classNames?.root,
      )}
      style={rootStyle}
      data-locale={locale}
      data-disabled={disabled ? "" : undefined}
      data-open={open ? "" : undefined}
    >
      <div className={cn("itzsa-ndp-field", classNames?.field)}>
        <input
          ref={inputRef}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          readOnly
          placeholder={
            placeholder ??
            (displayLocale === "ne"
              ? "मिति र समय छान्नुहोस्"
              : "Select date & time")
          }
          value={displayValue}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn("itzsa-ndp-input", inputClassName, classNames?.input)}
          onClick={() => {
            if (!disabled && !readOnly) setOpen(true);
          }}
          onFocus={() => {
            if (!disabled && !readOnly) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (disabled || readOnly) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((o) => !o);
            }
          }}
        />
        <button
          type="button"
          className={cn("itzsa-ndp-trigger", classNames?.trigger)}
          tabIndex={-1}
          disabled={disabled || readOnly}
          aria-label="Open date and time picker"
          onClick={() => {
            if (!disabled && !readOnly) setOpen((o) => !o);
          }}
        >
          <CalendarIcon />
        </button>
      </div>
      {popover}
    </div>
  );
});
