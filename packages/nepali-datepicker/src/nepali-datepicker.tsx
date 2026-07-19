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
  clampBsDate,
  todayBs,
} from "./convert";
import { formatBsLabel, parseDateString, toDateString } from "./format";
import { cn } from "./lib/utils";
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
import type { DateParts, Locale } from "./types";

export type NepaliDatePickerProps = {
  /** Controlled BS date as `YYYY-MM-DD` (ASCII). Empty string = no selection. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Called with canonical `YYYY-MM-DD` BS string (or `""` when cleared). */
  onChange?: (value: string) => void;
  /** Fired when a day is clicked (before close). */
  onSelect?: (value: string) => void;
  /** Calendar UI locale (month/weekday names + digits). Default `"ne"`. */
  locale?: Locale;
  /** Digits/locale for the input display. Default matches `locale`. */
  valueLocale?: Locale;
  /** Minimum selectable BS date `YYYY-MM-DD`. */
  minDate?: string;
  /** Maximum selectable BS date `YYYY-MM-DD`. */
  maxDate?: string;
  /** Inclusive year bounds (defaults to supported calendar range). */
  minYear?: number;
  maxYear?: number;
  /** Close popover after picking a day. Default `true`. */
  closeOnSelect?: boolean;
  /** If value is empty, show today as the initial calendar month. Default `true`. */
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
  /** Per-part class overrides (merged with defaults). */
  classNames?: NepaliDatePickerClassNames;
  /** Theme tokens as CSS variables (`accent`, `border`, `radius`, …). */
  vars?: NepaliDatePickerVars;
  /** Inline styles on the root (merged with `vars`). */
  style?: React.CSSProperties;
  /** Inline styles on the popover panel. */
  popoverStyle?: React.CSSProperties;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

function parseBound(value: string | undefined): DateParts | null {
  if (!value) return null;
  return parseDateString(value);
}

export const NepaliDatePicker = React.forwardRef<
  HTMLInputElement,
  NepaliDatePickerProps
>(function NepaliDatePicker(
  {
    value: valueProp,
    defaultValue = "",
    onChange,
    onSelect,
    locale = "ne",
    valueLocale,
    minDate,
    maxDate,
    minYear = BS_MIN_YEAR,
    maxYear = BS_MAX_YEAR,
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

  const minParts = React.useMemo(() => parseBound(minDate), [minDate]);
  const maxParts = React.useMemo(() => parseBound(maxDate), [maxDate]);
  const selected = React.useMemo(() => parseDateString(value), [value]);
  const today = React.useMemo(() => todayBs(), []);

  const initialView = React.useMemo((): DateParts => {
    if (selected) return selected;
    if (todayIfEmpty) return clampBsDate(today, minParts, maxParts);
    return {
      year: Math.min(Math.max(2080, minYear), maxYear),
      month: 1,
      day: 1,
    };
  }, [selected, todayIfEmpty, today, minParts, maxParts, minYear, maxYear]);

  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<{ year: number; month: number }>({
    year: initialView.year,
    month: initialView.month,
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const portalReady = usePortalReady();
  const { pos } = useFloatingPopover(open, rootRef, {
    minWidth: 288,
    estimatedHeight: 360,
  });

  React.useImperativeHandle(
    forwardedRef,
    () => inputRef.current as HTMLInputElement,
  );

  React.useEffect(() => {
    if (!open) return;
    const next = selected ?? (todayIfEmpty ? today : initialView);
    setView({ year: next.year, month: next.month });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = React.useCallback(() => setOpen(false), []);
  useDismissOnOutside(open, close, [rootRef, popoverRef]);

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const isDisabledDay = React.useMemo(
    () => createIsDisabledDay({ minYear, maxYear, minParts, maxParts }),
    [minYear, maxYear, minParts, maxParts],
  );

  const pickParts = (parts: DateParts) => {
    if (isDisabledDay(parts)) return;
    const str = toDateString(parts);
    setValue(str);
    onSelect?.(str);
    if (closeOnSelect) setOpen(false);
  };

  const displayValue = selected ? formatBsLabel(selected, displayLocale) : "";

  const popover =
    open && portalReady
      ? createPortal(
          <div
            ref={popoverRef}
            className={cn(
              "itzsa-ndp-popover",
              popoverClassName,
              classNames?.popover,
            )}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 50,
              ...panelStyle,
            }}
            role="dialog"
            aria-modal="false"
            aria-label="Nepali calendar"
          >
            <SingleCalendarPanel
              locale={locale}
              view={view}
              onViewChange={setView}
              selected={selected}
              today={today}
              minYear={minYear}
              maxYear={maxYear}
              isDisabledDay={isDisabledDay}
              onDayClick={pickParts}
              showClear={Boolean(value)}
              onToday={() => {
                const clamped = clampBsDate(today, minParts, maxParts);
                setView({ year: clamped.year, month: clamped.month });
                pickParts(clamped);
              }}
              onClear={() => {
                setValue("");
                onSelect?.("");
              }}
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={cn("itzsa-ndp", className, classNames?.root)}
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
            (displayLocale === "ne" ? "मिति छान्नुहोस्" : "Select date")
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
          aria-label="Open calendar"
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
