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
import {
  formatTypedBsDate,
  parseDateString,
  toDateString,
} from "./format";
import { cn, mergeRefs } from "./lib/utils";
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

export type EditableNepaliDatePickerProps = {
  /** Controlled value — may be partial while typing (`2082-0`, `2082-04-1`, …). */
  value?: string;
  defaultValue?: string;
  /**
   * Fires on every keystroke with masked `YYYY-MM-DD` digits,
   * and when a calendar day is picked (always complete & valid).
   */
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  locale?: Locale;
  minDate?: string;
  maxDate?: string;
  minYear?: number;
  maxYear?: number;
  closeOnSelect?: boolean;
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

function parseBound(value: string | undefined): DateParts | null {
  if (!value) return null;
  return parseDateString(value);
}

export const EditableNepaliDatePicker = React.forwardRef<
  HTMLInputElement,
  EditableNepaliDatePickerProps
>(function EditableNepaliDatePicker(
  {
    value: valueProp,
    defaultValue = "",
    onChange,
    onSelect,
    locale = "en",
    minDate,
    maxDate,
    minYear = BS_MIN_YEAR,
    maxYear = BS_MAX_YEAR,
    closeOnSelect = true,
    placeholder = "YYYY-MM-DD",
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
  const isControlled = valueProp !== undefined;
  const rootStyle = mergePickerStyle(vars, style);
  const panelStyle = mergePickerStyle(vars, popoverStyle);
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? (valueProp ?? "") : uncontrolled;

  const [localValue, setLocalValue] = React.useState(value);
  const cursorPosRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const minParts = React.useMemo(() => parseBound(minDate), [minDate]);
  const maxParts = React.useMemo(() => parseBound(maxDate), [maxDate]);
  const selected = React.useMemo(
    () => parseDateString(localValue.replace(/\//g, "-")),
    [localValue],
  );
  const today = React.useMemo(() => todayBs(), []);

  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<{ year: number; month: number }>(() => {
    const t = todayBs();
    return { year: t.year, month: t.month };
  });

  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const portalReady = usePortalReady();
  const { pos } = useFloatingPopover(open, rootRef, {
    minWidth: 288,
    estimatedHeight: 360,
  });

  React.useLayoutEffect(() => {
    if (cursorPosRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(
        cursorPosRef.current,
        cursorPosRef.current,
      );
      cursorPosRef.current = null;
    }
  });

  React.useEffect(() => {
    if (!open) return;
    const next = selected ?? clampBsDate(today, minParts, maxParts);
    setView({ year: next.year, month: next.month });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = React.useCallback(() => setOpen(false), []);
  useDismissOnOutside(open, close, [rootRef, popoverRef]);

  const commit = React.useCallback(
    (next: string) => {
      setLocalValue(next);
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const isDisabledDay = React.useMemo(
    () => createIsDisabledDay({ minYear, maxYear, minParts, maxParts }),
    [minYear, maxYear, minParts, maxParts],
  );

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selStart = input.selectionStart ?? 0;
    const raw = input.value;
    const formatted = formatTypedBsDate(raw);

    const digitsBeforeCursor = raw.slice(0, selStart).replace(/\D/g, "").length;
    let newPos = digitsBeforeCursor;
    if (digitsBeforeCursor > 4) newPos += 1;
    if (digitsBeforeCursor > 6) newPos += 1;
    cursorPosRef.current = Math.min(newPos, formatted.length);

    commit(formatted);
  };

  const pickParts = (parts: DateParts) => {
    if (isDisabledDay(parts)) return;
    const str = toDateString(parts);
    commit(str);
    onSelect?.(str);
    if (closeOnSelect) setOpen(false);
  };

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
            data-locale={locale}
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
              showClear={Boolean(localValue)}
              onToday={() => {
                const clamped = clampBsDate(today, minParts, maxParts);
                setView({ year: clamped.year, month: clamped.month });
                pickParts(clamped);
              }}
              onClear={() => {
                commit("");
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
      className={cn(
        "itzsa-ndp itzsa-ndp-editable",
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
          ref={mergeRefs(forwardedRef, inputRef)}
          id={id}
          name={name}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={localValue}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            "itzsa-ndp-input itzsa-ndp-input-editable",
            inputClassName,
            classNames?.input,
          )}
          onChange={readOnly ? undefined : handleType}
          onKeyDown={(e) => {
            if (disabled || readOnly) return;
            if (e.key === "ArrowDown" && (e.altKey || e.metaKey)) {
              e.preventDefault();
              setOpen(true);
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
