export const BASIC_EXAMPLE_CODE = `"use client";

import { useMemo, useState } from "react";
import {
  bsToAd,
  NepaliDatePicker,
  parseDateString,
  toDateString,
  todayBs,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function BasicExample() {
  const [date, setDate] = useState(() => toDateString(todayBs()));

  const adLabel = useMemo(() => {
    const parts = parseDateString(date);
    if (!parts) return null;
    try {
      const ad = bsToAd(parts.year, parts.month, parts.day);
      return \`\${ad.year}-\${String(ad.month).padStart(2, "0")}-\${String(ad.day).padStart(2, "0")}\`;
    } catch {
      return null;
    }
  }, [date]);

  return (
    <div>
      <label htmlFor="ndp-basic">मिति</label>
      <NepaliDatePicker
        id="ndp-basic"
        value={date}
        onChange={setDate}
        locale="ne"
      />
      <p>
        BS: {date || "—"} · AD: {adLabel ?? "—"}
      </p>
    </div>
  );
}`;

export const EDITABLE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  EditableNepaliDatePicker,
  isCompleteBsDate,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function EditableExample() {
  const [date, setDate] = useState("");

  return (
    <div>
      <label htmlFor="ndp-edit">Type or pick (YYYY-MM-DD)</label>
      <EditableNepaliDatePicker
        id="ndp-edit"
        value={date}
        onChange={setDate}
        locale="en"
        placeholder="YYYY-MM-DD"
      />
      <p>
        value: {date || "—"} · valid: {isCompleteBsDate(date) ? "yes" : "no"}
      </p>
    </div>
  );
}`;

export const DATETIME_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  NepaliDateTimePicker,
  toDateTimeString,
  todayBsDateTime,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function DateTimeExample() {
  const [value, setValue] = useState(() => toDateTimeString(todayBsDateTime()));

  return (
    <div>
      <label htmlFor="ndp-dt">Date & time</label>
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
      <p>value: {value || "—"}</p>
    </div>
  );
}`;

export const RANGE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  addBsDays,
  type BsDateRange,
  NepaliDateRangePicker,
  toDateString,
  todayBs,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function RangeExample() {
  const [range, setRange] = useState<BsDateRange>(() => {
    const t = todayBs();
    return {
      from: toDateString(t),
      to: toDateString(addBsDays(t, 7)),
    };
  });

  return (
    <div>
      <NepaliDateRangePicker
        value={range}
        onChange={setRange}
        locale="ne"
        numberOfMonths={2}
      />
      <p>
        from: {range.from ?? "—"} · to: {range.to ?? "—"}
      </p>
    </div>
  );
}`;

export const STYLED_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  NepaliDatePicker,
  toDateString,
  todayBs,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function StyledExample() {
  const [date, setDate] = useState(() => toDateString(todayBs()));

  return (
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
  );
}`;

export const LOCALE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  formatBsLabel,
  NepaliDatePicker,
  parseDateString,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function LocaleExample() {
  const [date, setDate] = useState("2082-01-01");
  const [locale, setLocale] = useState<"ne" | "en">("en");

  const parts = parseDateString(date);
  const label = parts ? formatBsLabel(parts, locale) : "—";

  return (
    <div>
      <button type="button" onClick={() => setLocale("ne")}>
        ne
      </button>
      <button type="button" onClick={() => setLocale("en")}>
        en
      </button>
      <NepaliDatePicker
        value={date}
        onChange={setDate}
        locale={locale}
        valueLocale={locale}
      />
      <p>Label: {label}</p>
    </div>
  );
}`;

export const BOUNDS_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import { NepaliDatePicker } from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function BoundsExample() {
  const [date, setDate] = useState("2082-04-15");

  return (
    <div>
      <p>Selectable: 2082-01-01 → 2082-12-30</p>
      <NepaliDatePicker
        value={date}
        onChange={setDate}
        locale="ne"
        minDate="2082-01-01"
        maxDate="2082-12-30"
        minYear={2082}
        maxYear={2082}
      />
      <p>value: {date}</p>
    </div>
  );
}`;

export const HELPERS_EXAMPLE_CODE = `"use client";

import { useMemo, useState } from "react";
import {
  adToBs,
  bsToAd,
  isCompleteBsDate,
  NepaliDatePicker,
  parseDateString,
  toDateString,
  todayBs,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function HelpersExample() {
  const [bs, setBs] = useState(() => toDateString(todayBs()));
  const [adInput, setAdInput] = useState(() => {
    const t = todayBs();
    const ad = bsToAd(t.year, t.month, t.day);
    return \`\${ad.year}-\${String(ad.month).padStart(2, "0")}-\${String(ad.day).padStart(2, "0")}\`;
  });

  const fromBs = useMemo(() => {
    const parts = parseDateString(bs);
    if (!parts || !isCompleteBsDate(bs)) {
      return { ok: false as const, error: "Pick a complete BS date" };
    }
    try {
      const ad = bsToAd(parts.year, parts.month, parts.day);
      return {
        ok: true as const,
        label: \`\${ad.year}-\${String(ad.month).padStart(2, "0")}-\${String(ad.day).padStart(2, "0")}\`,
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid BS date",
      };
    }
  }, [bs]);

  const fromAd = useMemo(() => {
    const m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(adInput.trim());
    if (!m) return { ok: false as const, error: "Use AD YYYY-MM-DD" };
    try {
      const converted = adToBs(Number(m[1]), Number(m[2]), Number(m[3]));
      return { ok: true as const, label: toDateString(converted) };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid AD date",
      };
    }
  }, [adInput]);

  return (
    <div>
      <label>BS → AD</label>
      <NepaliDatePicker
        value={bs}
        onChange={(next) => {
          setBs(next);
          const parts = parseDateString(next);
          if (!parts) return;
          try {
            const ad = bsToAd(parts.year, parts.month, parts.day);
            setAdInput(
              \`\${ad.year}-\${String(ad.month).padStart(2, "0")}-\${String(ad.day).padStart(2, "0")}\`,
            );
          } catch {
            /* keep AD */
          }
        }}
        locale="en"
      />
      {fromBs.ok ? <p>AD {fromBs.label}</p> : <p>{fromBs.error}</p>}

      <label>AD → BS</label>
      <input
        value={adInput}
        onChange={(e) => {
          const next = e.target.value;
          setAdInput(next);
          const m = /^(\\d{4})-(\\d{2})-(\\d{2})$/.exec(next.trim());
          if (!m) return;
          try {
            setBs(
              toDateString(
                adToBs(Number(m[1]), Number(m[2]), Number(m[3])),
              ),
            );
          } catch {
            /* keep BS */
          }
        }}
        placeholder="YYYY-MM-DD"
      />
      {fromAd.ok ? <p>BS {fromAd.label}</p> : <p>{fromAd.error}</p>}
    </div>
  );
}`;
