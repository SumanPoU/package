"use client";

import { useMemo, useState } from "react";
import {
  EditableNepaliDatePicker,
  NepaliDatePicker,
  NepaliDateRangePicker,
  addBsDays,
  adToBs,
  bsToAd,
  formatBsLabel,
  isCompleteBsDate,
  parseDateString,
  todayBs,
  toDateString,
  type BsDateRange,
} from "@itzsa/nepali-datepicker";

function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-medium tracking-wide text-secondary"
    >
      {children}
    </label>
  );
}

export function BasicExample() {
  const [date, setDate] = useState(() => toDateString(todayBs()));

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="ndp-basic">मिति</FieldLabel>
        <NepaliDatePicker
          id="ndp-basic"
          value={date}
          onChange={setDate}
          locale="ne"
        />
      </div>
      <p className="font-mono text-[12px] text-tertiary">
        value: <span className="text-primary">{date || "—"}</span>
      </p>
    </div>
  );
}

export function EditableExample() {
  const [date, setDate] = useState("");

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="ndp-edit">Type or pick (YYYY-MM-DD)</FieldLabel>
        <EditableNepaliDatePicker
          id="ndp-edit"
          value={date}
          onChange={setDate}
          locale="en"
          placeholder="YYYY-MM-DD"
        />
      </div>
      <p className="font-mono text-[12px] text-tertiary">
        value: <span className="text-primary">{date || "—"}</span>
        {" · "}
        valid:{" "}
        <span className="text-primary">
          {isCompleteBsDate(date) ? "yes" : "no"}
        </span>
      </p>
    </div>
  );
}

export function RangeExample() {
  const [range, setRange] = useState<BsDateRange>(() => {
    const t = todayBs();
    return {
      from: toDateString(t),
      to: toDateString(addBsDays(t, 7)),
    };
  });

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel>Date range</FieldLabel>
        <NepaliDateRangePicker
          value={range}
          onChange={setRange}
          locale="ne"
          numberOfMonths={2}
        />
      </div>
      <p className="font-mono text-[12px] text-tertiary">
        from: <span className="text-primary">{range.from ?? "—"}</span>
        {" · "}
        to: <span className="text-primary">{range.to ?? "—"}</span>
      </p>
    </div>
  );
}

export function LocaleExample() {
  const [date, setDate] = useState("2082-01-01");
  const [locale, setLocale] = useState<"ne" | "en">("en");

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {(["ne", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            className={
              locale === l
                ? "rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg"
                : "rounded-md border-[0.5px] border-border px-2.5 py-1 text-xs text-secondary"
            }
          >
            {l}
          </button>
        ))}
      </div>
      <NepaliDatePicker
        value={date}
        onChange={setDate}
        locale={locale}
        valueLocale={locale}
      />
      <p className="text-sm text-secondary">
        Label:{" "}
        <span className="text-primary">
          {(() => {
            const parts = parseDateString(date);
            return parts ? formatBsLabel(parts, locale) : "—";
          })()}
        </span>
      </p>
    </div>
  );
}

export function BoundsExample() {
  const [date, setDate] = useState("2082-04-15");

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <p className="text-sm text-secondary">
        Selectable range:{" "}
        <code className="font-mono text-primary">2082-01-01</code> →{" "}
        <code className="font-mono text-primary">2082-12-30</code>
      </p>
      <NepaliDatePicker
        value={date}
        onChange={setDate}
        locale="ne"
        minDate="2082-01-01"
        maxDate="2082-12-30"
        minYear={2082}
        maxYear={2082}
      />
      <p className="font-mono text-[12px] text-tertiary">
        value: <span className="text-primary">{date}</span>
      </p>
    </div>
  );
}

export function StyledExample() {
  const [date, setDate] = useState(() => toDateString(todayBs()));

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <NepaliDatePicker
        value={date}
        onChange={setDate}
        locale="en"
        vars={{
          accent: "#0f766e",
          radius: "12px",
          border: "#99f6e4",
          surface: "#f0fdfa",
        }}
        classNames={{
          input: "h-10 font-medium",
          popover: "shadow-lg",
        }}
      />
      <p className="text-[12px] text-secondary">
        Themed via <code className="font-mono text-primary">vars</code> +{" "}
        <code className="font-mono text-primary">classNames</code>.
      </p>
    </div>
  );
}

export function HelpersExample() {
  const today = useMemo(() => todayBs(), []);
  const ad = useMemo(
    () => bsToAd(today.year, today.month, today.day),
    [today],
  );
  const roundTrip = useMemo(
    () => adToBs(ad.year, ad.month, ad.day),
    [ad],
  );

  return (
    <div className="flex flex-col gap-3 rounded-md border-[0.5px] border-border bg-card p-4 font-mono text-[13px]">
      <p className="text-secondary">
        todayBs():{" "}
        <span className="text-primary">
          {today.year}-{today.month}-{today.day}
        </span>
      </p>
      <p className="text-secondary">
        → AD:{" "}
        <span className="text-primary">
          {ad.year}-{ad.month}-{ad.day}
        </span>
      </p>
      <p className="text-secondary">
        → BS again:{" "}
        <span className="text-primary">
          {roundTrip.year}-{roundTrip.month}-{roundTrip.day}
        </span>
      </p>
    </div>
  );
}
