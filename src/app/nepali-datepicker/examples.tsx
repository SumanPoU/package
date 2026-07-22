"use client";

import {
  addBsDays,
  adToBs,
  type BsDateRange,
  bsToAd,
  EditableNepaliDatePicker,
  formatBsLabel,
  isCompleteBsDate,
  NepaliDatePicker,
  NepaliDateRangePicker,
  NepaliDateTimePicker,
  parseDateString,
  toDateString,
  toDateTimeString,
  todayBs,
  todayBsDateTime,
} from "@itzsa/nepali-datepicker";
import { useMemo, useState } from "react";

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

  const adLabel = useMemo(() => {
    const parts = parseDateString(date);
    if (!parts) return null;
    try {
      const ad = bsToAd(parts.year, parts.month, parts.day);
      return `${ad.year}-${String(ad.month).padStart(2, "0")}-${String(ad.day).padStart(2, "0")}`;
    } catch {
      return null;
    }
  }, [date]);

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
        BS: <span className="text-primary">{date || "—"}</span>
        {" · "}
        AD: <span className="text-primary">{adLabel ?? "—"}</span>
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

export function DateTimeExample() {
  const [value, setValue] = useState(() => toDateTimeString(todayBsDateTime()));

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel htmlFor="ndp-dt">Date & time</FieldLabel>
        <NepaliDateTimePicker
          id="ndp-dt"
          value={value}
          onChange={setValue}
          locale="ne"
          minuteStep={5}
          minDateTime="2080-01-01 00:00"
          maxDateTime="2090-12-30 23:59"
          placeholder="मिति र समय"
        />
      </div>
      <p className="font-mono text-[12px] text-tertiary">
        value: <span className="text-primary">{value || "—"}</span>
      </p>
      <p className="text-[12px] text-secondary">
        Bounds: <code className="font-mono text-primary">2080-01-01 00:00</code>{" "}
        → <code className="font-mono text-primary">2090-12-30 23:59</code>
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
  const [bs, setBs] = useState(() => toDateString(todayBs()));
  const [adInput, setAdInput] = useState(() => {
    const t = todayBs();
    const ad = bsToAd(t.year, t.month, t.day);
    return `${ad.year}-${String(ad.month).padStart(2, "0")}-${String(ad.day).padStart(2, "0")}`;
  });

  const fromBs = useMemo(() => {
    const parts = parseDateString(bs);
    if (!parts || !isCompleteBsDate(bs)) {
      return { ok: false as const, error: "Pick or type a complete BS date" };
    }
    try {
      const ad = bsToAd(parts.year, parts.month, parts.day);
      return {
        ok: true as const,
        ad,
        label: `${ad.year}-${String(ad.month).padStart(2, "0")}-${String(ad.day).padStart(2, "0")}`,
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid BS date",
      };
    }
  }, [bs]);

  const fromAd = useMemo(() => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(adInput.trim());
    if (!m) {
      return { ok: false as const, error: "Use AD YYYY-MM-DD" };
    }
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    try {
      const converted = adToBs(year, month, day);
      return {
        ok: true as const,
        bs: converted,
        label: toDateString(converted),
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid AD date",
      };
    }
  }, [adInput]);

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <p className="text-[13px] leading-relaxed text-secondary">
        Pick a BS date — conversion uses{" "}
        <a href="/bs-date" className="text-accent hover:underline">
          @itzsa/bs-date
        </a>{" "}
        under the hood. Flip AD → BS below.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="ndp-helpers-bs">BS → AD</FieldLabel>
          <NepaliDatePicker
            id="ndp-helpers-bs"
            value={bs}
            onChange={(next) => {
              setBs(next);
              const parts = parseDateString(next);
              if (!parts) return;
              try {
                const ad = bsToAd(parts.year, parts.month, parts.day);
                setAdInput(
                  `${ad.year}-${String(ad.month).padStart(2, "0")}-${String(ad.day).padStart(2, "0")}`,
                );
              } catch {
                /* keep AD field */
              }
            }}
            locale="en"
          />
          {fromBs.ok ? (
            <p className="font-mono text-[13px] text-primary">
              AD <span className="text-accent">{fromBs.label}</span>
            </p>
          ) : (
            <p className="text-[12px] text-secondary">{fromBs.error}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="ndp-helpers-ad">AD → BS</FieldLabel>
          <input
            id="ndp-helpers-ad"
            value={adInput}
            onChange={(e) => {
              const next = e.target.value;
              setAdInput(next);
              const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(next.trim());
              if (!m) return;
              try {
                const converted = adToBs(
                  Number(m[1]),
                  Number(m[2]),
                  Number(m[3]),
                );
                setBs(toDateString(converted));
              } catch {
                /* keep BS field */
              }
            }}
            placeholder="YYYY-MM-DD"
            className="h-9 rounded-md border-[0.5px] border-border bg-page px-2.5 font-mono text-[13px] text-primary outline-none focus:border-accent"
          />
          {fromAd.ok ? (
            <p className="font-mono text-[13px] text-primary">
              BS <span className="text-accent">{fromAd.label}</span>
              {" · "}
              <button
                type="button"
                className="text-[12px] text-secondary underline-offset-2 hover:text-accent hover:underline"
                onClick={() => setBs(fromAd.label)}
              >
                apply to picker
              </button>
            </p>
          ) : (
            <p className="text-[12px] text-secondary">{fromAd.error}</p>
          )}
        </div>
      </div>

      <p className="font-mono text-[11px] text-tertiary">
        Round-trip check:{" "}
        {fromBs.ok && fromAd.ok && fromAd.label === bs
          ? "OK"
          : fromBs.ok
            ? "edit either side"
            : "—"}
      </p>
    </div>
  );
}
