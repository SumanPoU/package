"use client";

import * as React from "react";

import {
  BS_MAX_YEAR,
  BS_MIN_YEAR,
  addBsMonths,
  compareDateParts,
  getBsWeekday,
  getDaysInBsMonth,
  todayBs,
} from "./convert";
import { getMonthName, getWeekdayNames, localizeDigits } from "./locale";
import { cn } from "./lib/utils";
import { Chevron } from "./popover-utils";
import type { DateParts, Locale } from "./types";

export type ViewMode = "days" | "months" | "years";

export type DayModifiers = {
  selected?: boolean;
  today?: boolean;
  disabled?: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  inRange?: boolean;
  rangePreview?: boolean;
};

export type CalendarMonthProps = {
  year: number;
  month: number;
  locale: Locale;
  isDisabledDay: (parts: DateParts) => boolean;
  getModifiers: (parts: DateParts) => DayModifiers;
  onDayClick: (parts: DateParts) => void;
  onDayHover?: (parts: DateParts | null) => void;
  showHeader?: boolean;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  canPrevMonth?: boolean;
  canNextMonth?: boolean;
  onMonthTitleClick?: () => void;
  onYearTitleClick?: () => void;
};

export function CalendarMonth({
  year,
  month,
  locale,
  isDisabledDay,
  getModifiers,
  onDayClick,
  onDayHover,
  showHeader = true,
  onPrevMonth,
  onNextMonth,
  canPrevMonth = true,
  canNextMonth = true,
  onMonthTitleClick,
  onYearTitleClick,
}: CalendarMonthProps) {
  const weekdays = getWeekdayNames(locale);
  const daysInMonth = getDaysInBsMonth(year, month);
  const startWeekday = getBsWeekday(year, month, 1);

  return (
    <div className="itzsa-ndp-month">
      {showHeader ? (
        <div className="itzsa-ndp-header">
          {onPrevMonth ? (
            <button
              type="button"
              className="itzsa-ndp-nav-btn"
              disabled={!canPrevMonth}
              aria-label="Previous month"
              onClick={onPrevMonth}
            >
              <Chevron dir="left" />
            </button>
          ) : (
            <span className="itzsa-ndp-nav-spacer" />
          )}

          <div className="itzsa-ndp-header-title">
            {onMonthTitleClick ? (
              <button
                type="button"
                className="itzsa-ndp-title-btn"
                onClick={onMonthTitleClick}
              >
                {getMonthName(month, locale)}
              </button>
            ) : (
              <span className="itzsa-ndp-title-static">
                {getMonthName(month, locale)}
              </span>
            )}
            {onYearTitleClick ? (
              <button
                type="button"
                className="itzsa-ndp-title-btn"
                onClick={onYearTitleClick}
              >
                {localizeDigits(year, locale)}
              </button>
            ) : (
              <span className="itzsa-ndp-title-static">
                {localizeDigits(year, locale)}
              </span>
            )}
          </div>

          {onNextMonth ? (
            <button
              type="button"
              className="itzsa-ndp-nav-btn"
              disabled={!canNextMonth}
              aria-label="Next month"
              onClick={onNextMonth}
            >
              <Chevron dir="right" />
            </button>
          ) : (
            <span className="itzsa-ndp-nav-spacer" />
          )}
        </div>
      ) : null}

      <div className="itzsa-ndp-weekdays">
        {weekdays.map((w) => (
          <span key={w} className="itzsa-ndp-weekday">
            {w}
          </span>
        ))}
      </div>
      <div
        className="itzsa-ndp-days"
        role="grid"
        onMouseLeave={() => onDayHover?.(null)}
      >
        {Array.from({ length: startWeekday }).map((_, i) => (
          <span key={`e-${i}`} className="itzsa-ndp-day is-empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const parts = { year, month, day };
          const disabledDay = isDisabledDay(parts);
          const mod = getModifiers(parts);
          return (
            <button
              key={day}
              type="button"
              role="gridcell"
              disabled={disabledDay || mod.disabled}
              aria-selected={mod.selected || mod.rangeStart || mod.rangeEnd}
              className={cn(
                "itzsa-ndp-day",
                mod.selected && "is-selected",
                mod.today && "is-today",
                (disabledDay || mod.disabled) && "is-disabled",
                mod.rangeStart && "is-range-start",
                mod.rangeEnd && "is-range-end",
                mod.inRange && "is-in-range",
                mod.rangePreview && "is-range-preview",
              )}
              onClick={() => onDayClick(parts)}
              onMouseEnter={() => onDayHover?.(parts)}
            >
              {localizeDigits(day, locale)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type SingleCalendarPanelProps = {
  locale: Locale;
  view: { year: number; month: number };
  onViewChange: (view: { year: number; month: number }) => void;
  selected: DateParts | null;
  today: DateParts;
  minYear?: number;
  maxYear?: number;
  isDisabledDay: (parts: DateParts) => boolean;
  onDayClick: (parts: DateParts) => void;
  onToday?: () => void;
  onClear?: () => void;
  showClear?: boolean;
};

export function SingleCalendarPanel({
  locale,
  view,
  onViewChange,
  selected,
  today,
  minYear = BS_MIN_YEAR,
  maxYear = BS_MAX_YEAR,
  isDisabledDay,
  onDayClick,
  onToday,
  onClear,
  showClear = false,
}: SingleCalendarPanelProps) {
  const [mode, setMode] = React.useState<ViewMode>("days");

  const yearStart = Math.floor(view.year / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => yearStart + i).filter(
    (y) => y >= minYear && y <= maxYear,
  );

  const canPrevMonth = (() => {
    try {
      return addBsMonths(view.year, view.month, -1).year >= minYear;
    } catch {
      return false;
    }
  })();

  const canNextMonth = (() => {
    try {
      return addBsMonths(view.year, view.month, 1).year <= maxYear;
    } catch {
      return false;
    }
  })();

  return (
    <div className="itzsa-ndp-panel">
      {mode === "days" ? (
        <CalendarMonth
          year={view.year}
          month={view.month}
          locale={locale}
          isDisabledDay={isDisabledDay}
          getModifiers={(parts) => ({
            selected:
              selected != null && compareDateParts(selected, parts) === 0,
            today: compareDateParts(today, parts) === 0,
          })}
          onDayClick={onDayClick}
          canPrevMonth={canPrevMonth}
          canNextMonth={canNextMonth}
          onPrevMonth={() => {
            try {
              onViewChange(addBsMonths(view.year, view.month, -1));
            } catch {
              /* range */
            }
          }}
          onNextMonth={() => {
            try {
              onViewChange(addBsMonths(view.year, view.month, 1));
            } catch {
              /* range */
            }
          }}
          onMonthTitleClick={() => setMode("months")}
          onYearTitleClick={() => setMode("years")}
        />
      ) : null}

      {mode === "months" ? (
        <>
          <div className="itzsa-ndp-header">
            <span className="itzsa-ndp-nav-spacer" />
            <div className="itzsa-ndp-header-title">
              <button
                type="button"
                className="itzsa-ndp-title-btn"
                onClick={() => setMode("years")}
              >
                {localizeDigits(view.year, locale)}
              </button>
            </div>
            <span className="itzsa-ndp-nav-spacer" />
          </div>
          <div className="itzsa-ndp-grid-months">
            {Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              return (
                <button
                  key={month}
                  type="button"
                  className={cn(
                    "itzsa-ndp-chip",
                    view.month === month && "is-active",
                  )}
                  onClick={() => {
                    onViewChange({ year: view.year, month });
                    setMode("days");
                  }}
                >
                  {getMonthName(month, locale)}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {mode === "years" ? (
        <div className="itzsa-ndp-grid-years">
          <button
            type="button"
            className="itzsa-ndp-nav-btn itzsa-ndp-year-shift"
            disabled={yearStart - 12 < minYear}
            aria-label="Previous years"
            onClick={() =>
              onViewChange({
                ...view,
                year: Math.max(minYear, yearStart - 12),
              })
            }
          >
            <Chevron dir="left" />
          </button>
          <div className="itzsa-ndp-year-list">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                className={cn("itzsa-ndp-chip", view.year === y && "is-active")}
                onClick={() => {
                  onViewChange({ ...view, year: y });
                  setMode("months");
                }}
              >
                {localizeDigits(y, locale)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="itzsa-ndp-nav-btn itzsa-ndp-year-shift"
            disabled={yearStart + 12 > maxYear}
            aria-label="Next years"
            onClick={() =>
              onViewChange({
                ...view,
                year: Math.min(maxYear, yearStart + 12),
              })
            }
          >
            <Chevron dir="right" />
          </button>
        </div>
      ) : null}

      {(onToday || onClear) && (
        <div className="itzsa-ndp-footer">
          {onToday ? (
            <button
              type="button"
              className="itzsa-ndp-footer-btn"
              disabled={isDisabledDay(today)}
              onClick={onToday}
            >
              {locale === "ne" ? "आज" : "Today"}
            </button>
          ) : (
            <span />
          )}
          {showClear && onClear ? (
            <button
              type="button"
              className="itzsa-ndp-footer-btn"
              onClick={onClear}
            >
              {locale === "ne" ? "खाली" : "Clear"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function createIsDisabledDay(opts: {
  minYear: number;
  maxYear: number;
  minParts: DateParts | null;
  maxParts: DateParts | null;
}) {
  return (parts: DateParts) => {
    if (parts.year < opts.minYear || parts.year > opts.maxYear) return true;
    if (opts.minParts && compareDateParts(parts, opts.minParts) < 0) return true;
    if (opts.maxParts && compareDateParts(parts, opts.maxParts) > 0) return true;
    return false;
  };
}

export { todayBs };
