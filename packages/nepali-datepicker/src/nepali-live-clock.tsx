"use client";

import * as React from "react";

import { todayBsDateTime } from "./convert";
import { cn } from "./lib/utils";
import {
  formatNepaliDateTimeDisplay,
  type NepaliDateTimeDisplayFormat,
  type NepaliDateTimeDisplayOptions,
} from "./live-display";
import type { DateTimeParts } from "./types";

export type NepaliLiveClockProps = NepaliDateTimeDisplayOptions & {
  /** Display preset. Default `"time-date-two-line"`. */
  format?: NepaliDateTimeDisplayFormat;
  /**
   * Controlled BS datetime parts. When omitted, tracks the live clock
   * via `todayBsDateTime()` (updates every `tickMs`).
   */
  value?: DateTimeParts;
  /** Tick interval for live mode. Default `1000`. Set `0` to freeze. */
  tickMs?: number;
  className?: string;
  /** Extra class on each line. */
  lineClassName?: string;
  style?: React.CSSProperties;
  /** `aria-live` politeness. Default `"polite"`. */
  "aria-live"?: "off" | "polite" | "assertive";
};

/**
 * Live (or controlled) Nepali BS date/time display.
 *
 * @example
 * <NepaliLiveClock format="time-date-two-line-seconds" locale="ne" />
 * <NepaliLiveClock format="dmyw" value={parts} />
 */
export function NepaliLiveClock({
  format = "time-date-two-line",
  value,
  tickMs = 1000,
  className,
  lineClassName,
  style,
  "aria-live": ariaLive = "polite",
  ...displayOpts
}: NepaliLiveClockProps) {
  const live = value == null;
  const [now, setNow] = React.useState(() => value ?? todayBsDateTime());

  React.useEffect(() => {
    if (value) {
      setNow(value);
      return;
    }
    setNow(todayBsDateTime());
    if (tickMs <= 0) return;
    const id = window.setInterval(() => setNow(todayBsDateTime()), tickMs);
    return () => window.clearInterval(id);
  }, [value, tickMs]);

  const formatted = formatNepaliDateTimeDisplay(now, format, displayOpts);

  return (
    <div
      className={cn(
        "itzsa-ndp-live-clock",
        formatted.multiline && "is-multiline",
        live && "is-live",
        className,
      )}
      style={style}
      data-format={format}
      data-locale={displayOpts.locale ?? "ne"}
      role="status"
      aria-live={ariaLive}
    >
      {formatted.lines.map((line, i) => (
        <p
          key={`${i}-${line}`}
          className={cn("itzsa-ndp-live-line", lineClassName)}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
