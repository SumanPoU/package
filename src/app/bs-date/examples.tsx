"use client";

import {
  adToBs,
  bsToAdParts,
  diffInBsYears,
  formatBs,
  formatBsIso,
  getHolidaysInMonth,
  isPublicHoliday,
  todayBs,
  toNepaliNumerals,
} from "@itzsa/bs-date";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border-[0.5px] border-border bg-card p-4",
        className,
      )}
    >
      <p className="text-[12px] font-medium tracking-wide text-tertiary uppercase">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-[12px] text-secondary">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border-[0.5px] border-border bg-page px-2.5 py-1.5 font-mono text-[13px] text-primary outline-none focus:border-accent"
      />
    </label>
  );
}

export function ConvertExample() {
  const [ad, setAd] = useState("2025-04-14");
  const [bs, setBs] = useState("2082-01-01");

  const fromAd = useMemo(() => {
    try {
      const d = adToBs(ad);
      return {
        ok: true as const,
        iso: formatBsIso(d),
        ne: formatBs(d, "DD MMMM YYYY", { locale: "ne", nepaliDigits: true }),
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Invalid" };
    }
  }, [ad]);

  const fromBs = useMemo(() => {
    try {
      const parts = bsToAdParts(bs);
      return {
        ok: true as const,
        iso: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`,
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Invalid" };
    }
  }, [bs]);

  const today = todayBs();

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Panel title="AD → BS">
        <Field label="AD (YYYY-MM-DD)" value={ad} onChange={setAd} />
        {fromAd.ok ? (
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-mono text-primary">{fromAd.iso}</p>
            <p
              className="text-secondary"
              style={{
                fontFamily:
                  "var(--itzsa-nepali-font, var(--font-outfit), sans-serif)",
              }}
            >
              {fromAd.ne}
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">{fromAd.error}</p>
        )}
      </Panel>
      <Panel title="BS → AD">
        <Field label="BS (YYYY-MM-DD)" value={bs} onChange={setBs} />
        {fromBs.ok ? (
          <p className="font-mono text-sm text-primary">{fromBs.iso}</p>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">{fromBs.error}</p>
        )}
        <p className="text-[12px] text-tertiary">
          Today BS:{" "}
          <span className="font-mono text-secondary">{formatBsIso(today)}</span>
          {" · "}
          <span
            style={{
              fontFamily:
                "var(--itzsa-nepali-font, var(--font-outfit), sans-serif)",
            }}
          >
            {toNepaliNumerals(formatBsIso(today))}
          </span>
        </p>
      </Panel>
    </div>
  );
}

export function AgeExample() {
  const [dob, setDob] = useState("2070-05-15");
  const [asOf, setAsOf] = useState(() => formatBsIso(todayBs()));

  const years = useMemo(() => {
    try {
      return { ok: true as const, value: diffInBsYears(asOf, dob) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Invalid" };
    }
  }, [dob, asOf]);

  return (
    <Panel title="diffInBsYears (age / tenure)">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date of birth (BS)" value={dob} onChange={setDob} />
        <Field label="As of (BS)" value={asOf} onChange={setAsOf} />
      </div>
      {years.ok ? (
        <p className="text-sm text-primary">
          Completed years:{" "}
          <span className="font-mono text-accent text-base">{years.value}</span>
        </p>
      ) : (
        <p className="text-sm text-red-600 dark:text-red-400">{years.error}</p>
      )}
    </Panel>
  );
}

export function HolidaysExample() {
  const [year, setYear] = useState(2082);
  const [month, setMonth] = useState(1);

  const list = useMemo(
    () => getHolidaysInMonth(year, month),
    [year, month],
  );

  return (
    <Panel title="Holidays in month (sample calendar)">
      <div className="flex flex-wrap gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[12px] text-secondary">Year</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-24 rounded-md border-[0.5px] border-border bg-page px-2.5 py-1.5 font-mono text-[13px] text-primary outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-[12px] text-secondary">Month (1–12)</span>
          <input
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-24 rounded-md border-[0.5px] border-border bg-page px-2.5 py-1.5 font-mono text-[13px] text-primary outline-none focus:border-accent"
          />
        </label>
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-secondary">No sample holidays in this month.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((h) => {
            const key = `${h.year ?? "*"}-${h.month}-${h.day}-${h.nameEn}`;
            const iso = `${year}-${String(h.month).padStart(2, "0")}-${String(h.day).padStart(2, "0")}`;
            return (
              <li
                key={key}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b-[0.5px] border-border pb-2 text-sm last:border-0"
              >
                <span className="font-mono text-[12px] text-tertiary">{iso}</span>
                <span className="text-primary">{h.nameEn}</span>
                <span
                  className="text-secondary"
                  style={{
                    fontFamily:
                      "var(--itzsa-nepali-font, var(--font-outfit), sans-serif)",
                  }}
                >
                  {h.nameNe}
                </span>
                <span className="text-[11px] text-tertiary">
                  {isPublicHoliday(iso) ? "holiday" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
