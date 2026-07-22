export const CONVERT_EXAMPLE_CODE = `"use client";

import { useMemo, useState } from "react";
import {
  adToBs,
  bsToAdParts,
  formatBs,
  formatBsIso,
  todayBs,
  toNepaliNumerals,
} from "@itzsa/bs-date";

export function ConvertExample() {
  const [ad, setAd] = useState("2025-04-14");
  const [bs, setBs] = useState("2082-01-01");

  const fromAd = useMemo(() => {
    try {
      const d = adToBs(ad);
      return {
        ok: true as const,
        iso: formatBsIso(d),
        ne: formatBs(d, "DD MMMM YYYY", {
          locale: "ne",
          nepaliDigits: true,
        }),
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid",
      };
    }
  }, [ad]);

  const fromBs = useMemo(() => {
    try {
      const parts = bsToAdParts(bs);
      return {
        ok: true as const,
        iso: \`\${parts.year}-\${String(parts.month).padStart(2, "0")}-\${String(parts.day).padStart(2, "0")}\`,
      };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid",
      };
    }
  }, [bs]);

  const today = todayBs();

  return (
    <div>
      <label>
        AD (YYYY-MM-DD)
        <input value={ad} onChange={(e) => setAd(e.target.value)} />
      </label>
      {fromAd.ok ? (
        <p>
          {fromAd.iso} · {fromAd.ne}
        </p>
      ) : (
        <p>{fromAd.error}</p>
      )}

      <label>
        BS (YYYY-MM-DD)
        <input value={bs} onChange={(e) => setBs(e.target.value)} />
      </label>
      {fromBs.ok ? <p>{fromBs.iso}</p> : <p>{fromBs.error}</p>}

      <p>
        Today BS: {formatBsIso(today)} · {toNepaliNumerals(formatBsIso(today))}
      </p>
    </div>
  );
}`;

export const AGE_EXAMPLE_CODE = `"use client";

import { useMemo, useState } from "react";
import { diffInBsYears, formatBsIso, todayBs } from "@itzsa/bs-date";

export function AgeExample() {
  const [dob, setDob] = useState("2070-05-15");
  const [asOf, setAsOf] = useState(() => formatBsIso(todayBs()));

  const years = useMemo(() => {
    try {
      return { ok: true as const, value: diffInBsYears(asOf, dob) };
    } catch (e) {
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "Invalid",
      };
    }
  }, [dob, asOf]);

  return (
    <div>
      <label>
        Date of birth (BS)
        <input value={dob} onChange={(e) => setDob(e.target.value)} />
      </label>
      <label>
        As of (BS)
        <input value={asOf} onChange={(e) => setAsOf(e.target.value)} />
      </label>
      {years.ok ? (
        <p>Completed years: {years.value}</p>
      ) : (
        <p>{years.error}</p>
      )}
    </div>
  );
}`;
