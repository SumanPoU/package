"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import {
  createIsDisabledDay,
  SingleCalendarPanel,
} from "./calendar-panel";
import {
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  todayBs,
  todayBsDateTime,
} from "./convert";
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
  /** Minute increment. Default `5`. */
  minuteStep?: number;
  /** Include seconds in value / UI. Default `false`. */
  withSeconds?: boolean;
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
}: {
  label: string;
  values: number[];
  selected: number;
  locale: Locale;
  disabledValues?: Set<number>;
  onPick: (n: number) => void;
}) {
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>("[data-selected]");
    el?.scrollIntoView({ block: "center" });
  }, [selected]);

  return (
    <div className="itzsa-ndp-time-col">
      <p className="itzsa-ndp-time-col-label">{label}</p>
      <div ref={listRef} className="itzsa-ndp-time-list" role="listbox">
        {values.map((n) => {
          const disabled = disabledValues?.has(n) ?? false;
          const isSel = n === selected;
          return (
            <button
              key={n}
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
              {localizeDigits(pad2(n), locale)}
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
    minDateTime,
    minDate,
    maxDateTime,
    maxDate,
    minYear = BS_MIN_YEAR,
    maxYear = BS_MAX_YEAR,
    minuteStep = 5,
    withSeconds = false,
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
  const rootStyle = mergePickerStyle(vars, style);
  const panelStyle = mergePickerStyle(vars, popoverStyle);

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
      selected ?? (todayIfEmpty ? nowDt : { ...nowDt, hour: 0, minute: 0, second: 0 }),
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
    minWidth: 320,
    estimatedHeight: 420,
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
        minute: snapMinute(base.minute, minuteStep),
        second: withSeconds ? (base.second ?? 0) : 0,
      },
      minBound,
      maxBound,
    );
    setDraft(next);
    setView({ year: next.year, month: next.month });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

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
    [minBound, maxBound, withSeconds, isControlled, onChange, onSelect, closeOnSelect],
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

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from(
    { length: Math.floor(60 / Math.max(1, minuteStep)) },
    (_, i) => i * Math.max(1, minuteStep),
  );
  const seconds = Array.from({ length: 60 }, (_, i) => i);

  const disabledHours = React.useMemo(() => {
    const set = new Set<number>();
    for (const h of hours) {
      const probe: DateTimeParts = {
        ...draft,
        hour: h,
        minute: 0,
        second: 0,
      };
      const hi: DateTimeParts = {
        ...draft,
        hour: h,
        minute: 59,
        second: 59,
      };
      if (minBound && compareDateTimeParts(hi, minBound) < 0) set.add(h);
      if (maxBound && compareDateTimeParts(probe, maxBound) > 0) set.add(h);
    }
    return set;
  }, [draft, minBound, maxBound, hours]);

  const disabledMinutes = React.useMemo(() => {
    const set = new Set<number>();
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

  const displayValue = selected
    ? formatBsDateTimeLabel(selected, displayLocale, { withSeconds })
    : "";

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
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: Math.max(pos.width, 320),
              zIndex: 50,
              ...panelStyle,
            }}
            role="dialog"
            aria-modal="false"
            aria-label="Nepali date and time"
          >
            <div className="itzsa-ndp-datetime-layout">
              <SingleCalendarPanel
                locale={locale}
                view={view}
                onViewChange={setView}
                selected={dateTimeToDateParts(draft)}
                today={todayDate}
                minYear={minYear}
                maxYear={maxYear}
                isDisabledDay={isDisabledDay}
                onDayClick={onDayClick}
              />
              <div className="itzsa-ndp-time-panel">
                <p className="itzsa-ndp-time-heading">
                  {locale === "ne" ? "समय" : "Time"}
                </p>
                <div className="itzsa-ndp-time-cols">
                  <TimeColumn
                    label={locale === "ne" ? "घण्टा" : "Hour"}
                    values={hours}
                    selected={draft.hour}
                    locale={locale}
                    disabledValues={disabledHours}
                    onPick={(hour) =>
                      setDraftClamped({ ...draft, hour })
                    }
                  />
                  <TimeColumn
                    label={locale === "ne" ? "मिनेट" : "Min"}
                    values={minutes}
                    selected={snapMinute(draft.minute, minuteStep)}
                    locale={locale}
                    disabledValues={disabledMinutes}
                    onPick={(minute) =>
                      setDraftClamped({ ...draft, minute })
                    }
                  />
                  {withSeconds ? (
                    <TimeColumn
                      label={locale === "ne" ? "सेकेन्ड" : "Sec"}
                      values={seconds}
                      selected={draft.second ?? 0}
                      locale={locale}
                      onPick={(second) =>
                        setDraftClamped({ ...draft, second })
                      }
                    />
                  ) : null}
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
                      minute: snapMinute(now.minute, minuteStep),
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
      className={cn("itzsa-ndp itzsa-ndp-datetime", className, classNames?.root)}
      style={rootStyle}
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
