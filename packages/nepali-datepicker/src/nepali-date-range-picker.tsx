"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { CalendarMonth, createIsDisabledDay } from "./calendar-panel";
import {
  addBsMonths,
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  clampBsDate,
  compareDateParts,
  diffBsDays,
  todayBs,
} from "./convert";
import { formatBsLabel, parseDateString, toDateString } from "./format";
import { cn } from "./lib/utils";
import {
  CalendarIcon,
  Chevron,
  useDismissOnOutside,
  useFloatingPopover,
  usePortalReady,
} from "./popover-utils";
import {
  mergePickerStyle,
  type NepaliDatePickerVars,
  type NepaliDateRangeClassNames,
} from "./styling";
import type { DateParts, Locale } from "./types";

export type BsDateRange = {
  from?: string;
  to?: string;
};

export type NepaliDateRangePickerProps = {
  value?: BsDateRange;
  defaultValue?: BsDateRange;
  onChange?: (range: BsDateRange) => void;
  locale?: Locale;
  valueLocale?: Locale;
  minDate?: string;
  maxDate?: string;
  minYear?: number;
  maxYear?: number;
  /** Show one or two months. Default `2`. */
  numberOfMonths?: 1 | 2;
  /** Close after both ends are selected. Default `true`. */
  closeOnSelect?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  classNames?: NepaliDateRangeClassNames;
  vars?: NepaliDatePickerVars;
  style?: React.CSSProperties;
  popoverStyle?: React.CSSProperties;
  id?: string;
  "aria-label"?: string;
};

function parseBound(value: string | undefined): DateParts | null {
  if (!value) return null;
  return parseDateString(value);
}

function orderedRange(
  a: DateParts,
  b: DateParts,
): { from: DateParts; to: DateParts } {
  return compareDateParts(a, b) <= 0 ? { from: a, to: b } : { from: b, to: a };
}

function inInclusiveRange(
  day: DateParts,
  from: DateParts,
  to: DateParts,
): boolean {
  return compareDateParts(day, from) >= 0 && compareDateParts(day, to) <= 0;
}

export function NepaliDateRangePicker({
  value: valueProp,
  defaultValue = {},
  onChange,
  locale = "ne",
  valueLocale,
  minDate,
  maxDate,
  minYear = BS_MIN_YEAR,
  maxYear = BS_MAX_YEAR,
  numberOfMonths = 2,
  closeOnSelect = true,
  placeholder,
  disabled = false,
  className,
  triggerClassName,
  popoverClassName,
  classNames,
  vars,
  style,
  popoverStyle,
  id,
  "aria-label": ariaLabel,
}: NepaliDateRangePickerProps) {
  const displayLocale = valueLocale ?? locale;
  const rootStyle = mergePickerStyle(vars, style);
  const panelStyle = mergePickerStyle(vars, popoverStyle);
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const value = isControlled ? (valueProp ?? {}) : uncontrolled;

  const minParts = React.useMemo(() => parseBound(minDate), [minDate]);
  const maxParts = React.useMemo(() => parseBound(maxDate), [maxDate]);
  const fromParts = React.useMemo(
    () => (value.from ? parseDateString(value.from) : null),
    [value.from],
  );
  const toParts = React.useMemo(
    () => (value.to ? parseDateString(value.to) : null),
    [value.to],
  );

  const today = React.useMemo(() => todayBs(), []);
  const [open, setOpen] = React.useState(false);
  const [hover, setHover] = React.useState<DateParts | null>(null);
  /** First click while building a new range (before `to` is set). */
  const [anchor, setAnchor] = React.useState<DateParts | null>(null);

  const [leftView, setLeftView] = React.useState(() => {
    const t = todayBs();
    return { year: t.year, month: t.month };
  });

  const rightView = React.useMemo(() => {
    try {
      return addBsMonths(leftView.year, leftView.month, 1);
    } catch {
      return leftView;
    }
  }, [leftView]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const portalReady = usePortalReady();
  const dual = numberOfMonths === 2;
  const { pos } = useFloatingPopover(open, rootRef, {
    minWidth: dual ? 560 : 288,
    estimatedHeight: 380,
  });

  React.useEffect(() => {
    if (!open) return;
    const base = fromParts ?? clampBsDate(today, minParts, maxParts);
    setLeftView({ year: base.year, month: base.month });
    setAnchor(fromParts && !toParts ? fromParts : null);
    setHover(null);
  }, [open, fromParts, maxParts, minParts, toParts, today]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = React.useCallback(() => setOpen(false), []);
  useDismissOnOutside(open, close, [rootRef, popoverRef]);

  const commit = React.useCallback(
    (next: BsDateRange) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const isDisabledDay = React.useMemo(
    () => createIsDisabledDay({ minYear, maxYear, minParts, maxParts }),
    [minYear, maxYear, minParts, maxParts],
  );

  const previewTo = anchor && hover ? orderedRange(anchor, hover) : null;

  const getModifiers = (parts: DateParts) => {
    const start = fromParts;
    const end = toParts;
    const preview = !end && previewTo ? previewTo : null;

    const solidInRange =
      start && end
        ? inInclusiveRange(parts, start, end) &&
          compareDateParts(parts, start) !== 0 &&
          compareDateParts(parts, end) !== 0
        : false;
    const previewInRange =
      preview != null &&
      inInclusiveRange(parts, preview.from, preview.to) &&
      compareDateParts(parts, preview.from) !== 0 &&
      compareDateParts(parts, preview.to) !== 0;

    return {
      today: compareDateParts(today, parts) === 0,
      rangeStart: Boolean(
        (start && compareDateParts(parts, start) === 0) ||
          (preview && compareDateParts(parts, preview.from) === 0),
      ),
      rangeEnd: Boolean(
        (end && compareDateParts(parts, end) === 0) ||
          (preview &&
            compareDateParts(parts, preview.to) === 0 &&
            compareDateParts(preview.from, preview.to) !== 0),
      ),
      inRange: Boolean(solidInRange || previewInRange),
      rangePreview: Boolean(previewInRange),
      selected: Boolean(
        (start && compareDateParts(parts, start) === 0) ||
          (end && compareDateParts(parts, end) === 0),
      ),
    };
  };

  const onDayClick = (parts: DateParts) => {
    if (isDisabledDay(parts)) return;

    if (!anchor) {
      setAnchor(parts);
      commit({ from: toDateString(parts), to: undefined });
      return;
    }

    const { from, to } = orderedRange(anchor, parts);
    commit({ from: toDateString(from), to: toDateString(to) });
    setAnchor(null);
    setHover(null);
    if (closeOnSelect) setOpen(false);
  };

  const shiftLeft = (delta: number) => {
    try {
      setLeftView(addBsMonths(leftView.year, leftView.month, delta));
    } catch {
      /* bounds */
    }
  };

  const canPrev = (() => {
    try {
      return addBsMonths(leftView.year, leftView.month, -1).year >= minYear;
    } catch {
      return false;
    }
  })();

  const canNext = (() => {
    try {
      const step = dual ? 1 : 1;
      const next = addBsMonths(
        dual ? rightView.year : leftView.year,
        dual ? rightView.month : leftView.month,
        step,
      );
      return next.year <= maxYear;
    } catch {
      return false;
    }
  })();

  const nights =
    fromParts && toParts ? Math.max(0, diffBsDays(fromParts, toParts)) : null;

  const label = (() => {
    if (fromParts && toParts) {
      return `${formatBsLabel(fromParts, displayLocale)} – ${formatBsLabel(toParts, displayLocale)}`;
    }
    if (fromParts) {
      return `${formatBsLabel(fromParts, displayLocale)} – …`;
    }
    return (
      placeholder ??
      (displayLocale === "ne" ? "मिति दायरा छान्नुहोस्" : "Pick a date range")
    );
  })();

  const popover =
    open && portalReady
      ? createPortal(
          <div
            ref={popoverRef}
            className={cn(
              "itzsa-ndp-popover itzsa-ndp-popover-range",
              dual && "is-dual",
              popoverClassName,
              classNames?.popover,
            )}
            data-locale={locale}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: Math.max(pos.width, dual ? 560 : 288),
              zIndex: 50,
              ...panelStyle,
            }}
            role="dialog"
            aria-modal="false"
            aria-label="Nepali date range"
          >
            <div className="itzsa-ndp-range-toolbar">
              <button
                type="button"
                className="itzsa-ndp-nav-btn"
                disabled={!canPrev}
                aria-label="Previous month"
                onClick={() => shiftLeft(-1)}
              >
                <Chevron dir="left" />
              </button>
              <p className="itzsa-ndp-range-hint">
                {locale === "ne"
                  ? anchor || (fromParts && !toParts)
                    ? "अन्तिम मिति छान्नुहोस्"
                    : "सुरु मिति छान्नुहोस्"
                  : anchor || (fromParts && !toParts)
                    ? "Select end date"
                    : "Select start date"}
              </p>
              <button
                type="button"
                className="itzsa-ndp-nav-btn"
                disabled={!canNext}
                aria-label="Next month"
                onClick={() => shiftLeft(1)}
              >
                <Chevron dir="right" />
              </button>
            </div>

            <div
              className={cn(
                "itzsa-ndp-range-months",
                dual && "is-dual",
                classNames?.rangeMonths,
              )}
            >
              <CalendarMonth
                year={leftView.year}
                month={leftView.month}
                locale={locale}
                isDisabledDay={isDisabledDay}
                getModifiers={getModifiers}
                onDayClick={onDayClick}
                onDayHover={setHover}
                showHeader
                onPrevMonth={undefined}
                onNextMonth={undefined}
              />
              {dual ? (
                <CalendarMonth
                  year={rightView.year}
                  month={rightView.month}
                  locale={locale}
                  isDisabledDay={isDisabledDay}
                  getModifiers={getModifiers}
                  onDayClick={onDayClick}
                  onDayHover={setHover}
                  showHeader
                />
              ) : null}
            </div>

            <div className="itzsa-ndp-footer itzsa-ndp-range-footer">
              <p className="itzsa-ndp-range-meta">
                {nights != null
                  ? locale === "ne"
                    ? `${nights} दिन`
                    : `${nights} day${nights === 1 ? "" : "s"}`
                  : locale === "ne"
                    ? "दायरा छान्नुहोस्"
                    : "Select a range"}
              </p>
              <div className="itzsa-ndp-range-actions">
                <button
                  type="button"
                  className="itzsa-ndp-footer-btn"
                  onClick={() => {
                    commit({});
                    setAnchor(null);
                    setHover(null);
                  }}
                >
                  {locale === "ne" ? "खाली" : "Clear"}
                </button>
                <button
                  type="button"
                  className="itzsa-ndp-footer-btn is-primary"
                  disabled={!fromParts || !toParts}
                  onClick={() => setOpen(false)}
                >
                  {locale === "ne" ? "ठिक छ" : "Done"}
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
      className={cn("itzsa-ndp itzsa-ndp-range", className, classNames?.root)}
      style={rootStyle}
      data-locale={locale}
      data-disabled={disabled ? "" : undefined}
      data-open={open ? "" : undefined}
    >
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "itzsa-ndp-range-trigger",
          triggerClassName,
          classNames?.rangeTrigger,
        )}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
      >
        <CalendarIcon className="itzsa-ndp-range-trigger-icon" />
        <span
          className={cn(
            "itzsa-ndp-range-trigger-label",
            !(fromParts || toParts) && "is-placeholder",
            classNames?.rangeLabel,
          )}
        >
          {label}
        </span>
        <Chevron dir="down" className="itzsa-ndp-range-trigger-chevron" />
      </button>
      {popover}
    </div>
  );
}
