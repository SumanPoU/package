"use client";

import { createNrbForexClient, type ForexRate } from "@itzsa/nrb-forex";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

const controlClass =
  "h-9 rounded-md border-[0.5px] border-border bg-card px-2.5 text-[13px] text-primary outline-none transition-colors focus:border-accent";

const panelClass =
  "min-w-0 max-w-full rounded-xl border-[0.5px] border-border bg-card p-3 shadow-[0_1px_0_color-mix(in_oklab,var(--border)_70%,transparent)] sm:p-5";

const tableShellClass =
  "min-w-0 max-w-full overflow-hidden rounded-lg border-[0.5px] border-border bg-card";

/**
 * One client per browser tab — MemoryForexCache survives React remounts.
 * Full page reload still benefits from the docs proxy HTTP / CDN cache.
 */
let docsClientSingleton: ReturnType<typeof createNrbForexClient> | null = null;

function docsClient() {
  if (docsClientSingleton) return docsClientSingleton;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  docsClientSingleton = createNrbForexClient({
    baseUrl: `${origin}/api/nrb-forex`,
    maxRetries: 2,
    retryBaseMs: 150,
    fallbackToPreviousDay: true,
  });
  return docsClientSingleton;
}

/** Flag regions for every ISO3 NRB currently publishes (+ common extras). */
const FLAG_REGION: Record<string, string> = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  AUD: "au",
  CAD: "ca",
  CHF: "ch",
  SGD: "sg",
  JPY: "jp",
  KRW: "kr",
  INR: "in",
  SEK: "se",
  DKK: "dk",
  HKD: "hk",
  AED: "ae",
  THB: "th",
  MYR: "my",
  SAR: "sa",
  CNY: "cn",
  QAR: "qa",
  KWD: "kw",
  BHD: "bh",
  OMR: "om",
  NZD: "nz",
  NOK: "no",
  PKR: "pk",
  BDT: "bd",
  LKR: "lk",
  NPR: "np",
  RUB: "ru",
  TRY: "tr",
  ZAR: "za",
  BRL: "br",
  MXN: "mx",
  PHP: "ph",
  IDR: "id",
  VND: "vn",
  PLN: "pl",
  CZK: "cz",
  HUF: "hu",
  ILS: "il",
  EGP: "eg",
};

function Flag({ iso3, className }: { iso3: string; className?: string }) {
  const region = FLAG_REGION[iso3] ?? "un";
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-4 w-[22px] shrink-0 rounded-[2px] bg-muted bg-cover bg-center ring-1 ring-border/80",
        className,
      )}
      style={{
        backgroundImage: `url(https://flagcdn.com/w40/${region}.png)`,
      }}
    />
  );
}

function formatRate(n: number): string {
  return n.toLocaleString("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

function todayIsoLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function CurrencyPopover({
  options,
  selected,
  onChange,
}: {
  options: ForexRate[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const updateCoords = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(320, Math.max(260, r.width));
    let left = r.right - width;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    const below = r.bottom + 6;
    const spaceBelow = window.innerHeight - below;
    const top =
      spaceBelow < 280 && r.top > 280
        ? r.top - Math.min(320, spaceBelow + r.height) - 6
        : below;
    setCoords({ top, left, width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateCoords();
    const onWin = () => updateCoords();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, updateCoords]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      const panel = document.getElementById(panelId);
      if (panel?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDoc);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open, panelId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (r) =>
        r.currency.toLowerCase().includes(q) ||
        r.currencyName.toLowerCase().includes(q),
    );
  }, [options, query]);

  const allSelected = options.length > 0 && selected.size === options.length;
  const label =
    selected.size === 0
      ? "None selected"
      : allSelected
        ? `All (${options.length})`
        : `${selected.size} of ${options.length}`;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border-[0.5px] border-border bg-card px-2.5 text-[13px] text-primary shadow-sm transition-colors hover:border-accent/40 sm:w-auto sm:min-w-[11rem]"
      >
        <span className="truncate text-secondary">{label}</span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 shrink-0 text-tertiary transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && coords
        ? createPortal(
            <div
              id={panelId}
              role="listbox"
              aria-multiselectable
              style={{
                position: "fixed",
                top: coords.top,
                left: coords.left,
                width: coords.width,
                zIndex: 80,
              }}
              className="overflow-hidden rounded-lg border-[0.5px] border-border bg-card shadow-xl"
            >
              <div className="flex items-center gap-2 border-b-[0.5px] border-border px-3 py-2">
                <SearchIcon className="size-3.5 shrink-0 text-tertiary" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search currency…"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-primary outline-none placeholder:text-tertiary"
                />
              </div>
              <div className="flex items-center justify-between gap-2 border-b-[0.5px] border-border px-3 py-1.5">
                <button
                  type="button"
                  className="text-[12px] font-medium text-accent hover:underline"
                  onClick={() =>
                    onChange(new Set(options.map((r) => r.currency)))
                  }
                >
                  Select all
                </button>
                <button
                  type="button"
                  className="text-[12px] text-secondary hover:text-primary"
                  onClick={() => onChange(new Set())}
                >
                  Clear
                </button>
              </div>
              <ul className="example-demo-scroll max-h-72 overflow-y-auto py-1">
                {filtered.length === 0 ? (
                  <li className="px-3 py-3 text-[12px] text-tertiary">
                    No matches
                  </li>
                ) : (
                  filtered.map((r) => {
                    const on = selected.has(r.currency);
                    return (
                      <li key={r.currency}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={on}
                          onClick={() => {
                            const next = new Set(selected);
                            if (on) next.delete(r.currency);
                            else next.add(r.currency);
                            onChange(next);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-muted/70",
                            on && "bg-muted/40",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center rounded-[3px] border-[0.5px]",
                              on
                                ? "border-accent bg-accent text-accent-fg"
                                : "border-border bg-card",
                            )}
                          >
                            {on ? (
                              <CheckIcon className="size-2.5" strokeWidth={3} />
                            ) : null}
                          </span>
                          <Flag iso3={r.currency} />
                          <span className="min-w-0 flex-1 truncate font-medium text-primary">
                            {r.currencyName}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-tertiary">
                            {r.currency}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <p className="border-t-[0.5px] border-border px-3 py-1.5 text-[11px] text-tertiary">
                {options.length} currencies published by NRB for this date
              </p>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function RatesTable({ rows }: { rows: ForexRate[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-secondary">
        No rates match the current filters.
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked rows — no horizontal scroll */}
      <ul className="divide-y divide-border sm:hidden">
        {rows.map((r) => {
          const mid = (r.buy + r.sell) / 2;
          return (
            <li key={`${r.currency}-${r.date}`} className="px-3 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <Flag iso3={r.currency} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-primary">
                    {r.currencyName}
                  </p>
                  <p className="font-mono text-[11px] text-tertiary">
                    {r.currency}
                    {r.unit !== 1 ? ` · unit ${r.unit}` : null}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-muted/50 px-1.5 py-1.5">
                  <p className="text-[10px] tracking-wide text-tertiary uppercase">
                    Buy
                  </p>
                  <p className="font-mono text-[12px] text-primary tabular-nums">
                    {formatRate(r.buy)}
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 px-1.5 py-1.5">
                  <p className="text-[10px] tracking-wide text-tertiary uppercase">
                    Sell
                  </p>
                  <p className="font-mono text-[12px] text-primary tabular-nums">
                    {formatRate(r.sell)}
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 px-1.5 py-1.5">
                  <p className="text-[10px] tracking-wide text-tertiary uppercase">
                    Mid
                  </p>
                  <p className="font-mono text-[12px] text-secondary tabular-nums">
                    {formatRate(mid)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop / tablet: full table */}
      <div className="hidden w-full min-w-0 overflow-x-auto sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-[0.5px] border-border bg-card">
              <th className="px-3 py-2.5 text-[11px] font-medium tracking-wide text-tertiary uppercase md:px-4">
                Currency
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-medium tracking-wide text-tertiary uppercase md:px-4">
                Unit
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-medium tracking-wide text-tertiary uppercase md:px-4">
                Buy
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-medium tracking-wide text-tertiary uppercase md:px-4">
                Sell
              </th>
              <th className="px-3 py-2.5 text-right text-[11px] font-medium tracking-wide text-tertiary uppercase md:px-4">
                Mid
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const mid = (r.buy + r.sell) / 2;
              return (
                <tr
                  key={`${r.currency}-${r.date}`}
                  className="border-b-[0.5px] border-border last:border-0 hover:bg-muted/25"
                >
                  <td className="px-3 py-2.5 md:px-4">
                    <span className="inline-flex max-w-full items-center gap-2 md:gap-2.5">
                      <Flag iso3={r.currency} />
                      <span className="min-w-0 truncate font-medium text-primary">
                        {r.currencyName}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-tertiary">
                        {r.currency}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] text-secondary tabular-nums md:px-4">
                    {r.unit}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] text-primary tabular-nums md:px-4">
                    {formatRate(r.buy)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] text-primary tabular-nums md:px-4">
                    {formatRate(r.sell)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-[13px] text-secondary tabular-nums md:px-4">
                    {formatRate(mid)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export const RATES_BOARD_CODE = `"use client";

import { useEffect, useMemo, useState } from "react";
import { createNrbForexClient, type ForexRate } from "@itzsa/nrb-forex";

// Browser needs a proxy — NRB has no CORS. Node can omit baseUrl.
const client = createNrbForexClient({ baseUrl: "/api/nrb-forex" });

export function ForexRatesBoard() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rates, setRates] = useState<ForexRate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    void client
      .getRatesForDate(date, { fallbackToPreviousDay: true })
      .then((rows) => {
        // Every currency NRB published that day
        setRates(rows);
        setSelected(new Set(rows.map((r) => r.currency)));
      });
  }, [date]);

  const visible = useMemo(
    () => rates.filter((r) => selected.has(r.currency)),
    [rates, selected],
  );

  return (
    <section>
      <h2>Latest FOREX Rates</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      {/* Multi-select popover over \`rates\` — Select all / Clear / search */}
      <table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>Unit</th>
            <th>Buy</th>
            <th>Sell</th>
            <th>Mid</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r.currency}>
              <td>
                {r.currencyName} ({r.currency})
              </td>
              <td>{r.unit}</td>
              <td>{r.buy}</td>
              <td>{r.sell}</td>
              <td>{((r.buy + r.sell) / 2).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}`;

/** Full NRB board — all published currencies, portal popover, no clipped layout. */
export function ForexRatesBoard() {
  const [date, setDate] = useState(() => todayIsoLocal());
  const [rates, setRates] = useState<ForexRate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [publishedOn, setPublishedOn] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (iso: string) => {
    setLoading(true);
    setError(null);
    try {
      const rows = await docsClient().getRatesForDate(iso, {
        fallbackToPreviousDay: true,
      });
      // Sort: major first, then alpha — still includes every NRB row
      const order = [
        "USD",
        "EUR",
        "GBP",
        "INR",
        "JPY",
        "CNY",
        "AUD",
        "CAD",
        "CHF",
        "SGD",
      ];
      const sorted = [...rows].sort((a, b) => {
        const ai = order.indexOf(a.currency);
        const bi = order.indexOf(b.currency);
        if (ai >= 0 || bi >= 0) {
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        }
        return a.currency.localeCompare(b.currency);
      });
      setRates(sorted);
      setSelected(new Set(sorted.map((r) => r.currency)));
      setPublishedOn(sorted[0]?.publishedOn ?? sorted[0]?.date ?? null);
    } catch (e) {
      setRates([]);
      setSelected(new Set());
      setPublishedOn(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(date);
  }, [date, load]);

  const visible = useMemo(
    () => rates.filter((r) => selected.has(r.currency)),
    [rates, selected],
  );

  return (
    <div className={panelClass}>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-[15px] font-medium tracking-tight text-primary sm:text-base">
            Latest FOREX Rates
          </h3>
          <p className="text-[12px] leading-relaxed text-tertiary">
            Nepal Rastra Bank · NPR quotes ·{" "}
            {publishedOn ? (
              <span className="font-mono text-secondary">{publishedOn}</span>
            ) : (
              "—"
            )}
            {rates[0]?.isFallback ? " · prior business day" : null}
            {rates.length > 0 ? ` · ${rates.length} currencies` : null}
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-wrap items-end gap-3">
          <label className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
            <span className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
              Select date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(controlClass, "w-full font-mono sm:w-auto")}
            />
          </label>
          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-none">
            <span className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
              Currency
            </span>
            <CurrencyPopover
              options={rates}
              selected={selected}
              onChange={setSelected}
            />
          </div>
        </div>
      </div>

      <div className={cn(tableShellClass, "mt-4")}>
        {loading ? (
          <p className="px-4 py-12 text-center text-sm text-tertiary">
            Loading rates…
          </p>
        ) : error ? (
          <p className="px-4 py-12 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          <RatesTable rows={visible} />
        )}
      </div>
    </div>
  );
}

export const CONVERT_EXAMPLE_CODE = `"use client";

import { useEffect, useState } from "react";
import { createNrbForexClient } from "@itzsa/nrb-forex";

const client = createNrbForexClient({ baseUrl: "/api/nrb-forex" });

export function ConvertExample() {
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState("INR");
  const [side, setSide] = useState<"buy" | "sell" | "mid">("buy");
  const [npr, setNpr] = useState<number | null>(null);

  useEffect(() => {
    void client
      .convert(amount, currency, "NPR", {
        side,
        fallbackToPreviousDay: true,
      })
      .then(setNpr)
      .catch(() => setNpr(null));
  }, [amount, currency, side]);

  return (
    <div>
      <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      <input value={currency} onChange={(e) => setCurrency(e.target.value)} />
      <select value={side} onChange={(e) => setSide(e.target.value as "buy" | "sell" | "mid")}>
        <option value="buy">buy</option>
        <option value="sell">sell</option>
        <option value="mid">mid</option>
      </select>
      {npr != null ? <p>{amount} {currency} → {npr.toFixed(2)} NPR</p> : null}
    </div>
  );
}`;

export function ConvertExample() {
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState("INR");
  const [side, setSide] = useState<"buy" | "sell" | "mid">("buy");
  const [codes, setCodes] = useState<string[]>(["INR", "USD", "EUR", "JPY"]);
  const [npr, setNpr] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void docsClient()
      .getSupportedCurrencies(undefined, { fallbackToPreviousDay: true })
      .then((list) => setCodes(list.map((c) => c.iso3)))
      .catch(() => undefined);
  }, []);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const value = await docsClient().convert(
        amount,
        currency.trim().toUpperCase(),
        "NPR",
        { side, fallbackToPreviousDay: true },
      );
      setNpr(value);
    } catch (e) {
      setNpr(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [amount, currency, side]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <div className={panelClass}>
      <div className="flex flex-wrap gap-3">
        <Field label="Amount">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={cn(controlClass, "w-28 font-mono")}
          />
        </Field>
        <Field label="From">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={cn(controlClass, "min-w-[8rem]")}
          >
            {codes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Side">
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as "buy" | "sell" | "mid")}
            className={controlClass}
          >
            <option value="buy">buy</option>
            <option value="sell">sell</option>
            <option value="mid">mid</option>
          </select>
        </Field>
      </div>
      {loading ? (
        <p className="mt-3 text-sm text-tertiary">Converting…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : npr != null ? (
        <p className="mt-3 rounded-lg border-[0.5px] border-border bg-card px-3 py-2.5 font-mono text-sm text-primary shadow-sm">
          {amount.toLocaleString("en-NP")} {currency} →{" "}
          <span className="font-medium text-accent">
            {npr.toLocaleString("en-NP", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>{" "}
          NPR · {side}
        </p>
      ) : null}
      <p className="mt-3 text-[12px] text-tertiary">
        Unit-aware — INR (100) and JPY (10) stay correct automatically.
      </p>
    </div>
  );
}

export const HISTORY_EXAMPLE_CODE = `"use client";

import { useEffect, useState } from "react";
import { createNrbForexClient, type ForexRate } from "@itzsa/nrb-forex";

const client = createNrbForexClient({ baseUrl: "/api/nrb-forex" });

export function HistoryExample() {
  const [currency, setCurrency] = useState("USD");
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-07-22");
  const [rows, setRows] = useState<ForexRate[]>([]);

  useEffect(() => {
    void client.getRateHistory(currency, from, to).then(setRows);
  }, [currency, from, to]);

  return (
    <div>
      <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
      </select>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      <ul>
        {rows.map((r) => (
          <li key={r.date}>
            {r.date}: buy {r.buy} / sell {r.sell}
          </li>
        ))}
      </ul>
    </div>
  );
}`;

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function HistoryExample() {
  const [currency, setCurrency] = useState("USD");
  const [from, setFrom] = useState(() => daysAgoIso(14));
  const [to, setTo] = useState(() => todayIsoLocal());
  const [codes, setCodes] = useState<string[]>([
    "USD",
    "EUR",
    "GBP",
    "INR",
    "JPY",
    "CNY",
    "AUD",
    "AED",
  ]);
  const [rows, setRows] = useState<ForexRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void docsClient()
      .getSupportedCurrencies(undefined, { fallbackToPreviousDay: true })
      .then((list) => setCodes(list.map((c) => c.iso3)))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!from || !to || from > to) {
      setRows([]);
      setError(from > to ? "From date must be on or before To date." : null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await docsClient().getRateHistory(currency, from, to);
        if (!cancelled) setRows(history);
      } catch (e) {
        if (!cancelled) {
          setRows([]);
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currency, from, to]);

  const sells = rows.map((r) => r.sell);
  const minSell = sells.length ? Math.min(...sells) : 0;
  const maxSell = sells.length ? Math.max(...sells) : 1;
  const range = maxSell - minSell;

  return (
    <div className={panelClass}>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Currency">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={cn(controlClass, "max-w-full")}
          >
            {codes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="From">
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
            className={cn(controlClass, "font-mono")}
          />
        </Field>
        <Field label="To">
          <input
            type="date"
            value={to}
            min={from}
            max={todayIsoLocal()}
            onChange={(e) => setTo(e.target.value)}
            className={cn(controlClass, "font-mono")}
          />
        </Field>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-tertiary">Loading history…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-3 text-sm text-secondary">
          No published days in range.
        </p>
      ) : (
        <div className={cn(tableShellClass, "mt-4")}>
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-border bg-card">
                  <th className="px-3 py-2 text-[11px] font-medium tracking-wide text-tertiary uppercase">
                    Date
                  </th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium tracking-wide text-tertiary uppercase">
                    Buy
                  </th>
                  <th className="px-3 py-2 text-right text-[11px] font-medium tracking-wide text-tertiary uppercase">
                    Sell
                  </th>
                  <th className="hidden px-3 py-2 text-[11px] font-medium tracking-wide text-tertiary uppercase md:table-cell">
                    Sell trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const pct =
                    range === 0 ? 100 : 18 + ((r.sell - minSell) / range) * 82;
                  return (
                    <tr
                      key={r.date}
                      className="border-b-[0.5px] border-border last:border-0 hover:bg-muted/20"
                    >
                      <td className="px-3 py-2 font-mono text-[12px] whitespace-nowrap text-tertiary">
                        {r.date}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[13px] text-primary tabular-nums">
                        {formatRate(r.buy)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-[13px] text-primary tabular-nums">
                        {formatRate(r.sell)}
                      </td>
                      <td className="hidden px-3 py-2 md:table-cell">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-accent/70"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export const CURRENCIES_EXAMPLE_CODE = `"use client";

import { useEffect, useState } from "react";
import { createNrbForexClient, type ForexRate } from "@itzsa/nrb-forex";

const client = createNrbForexClient({ baseUrl: "/api/nrb-forex" });

export function CurrenciesExample() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rates, setRates] = useState<ForexRate[]>([]);

  useEffect(() => {
    void client
      .getRatesForDate(date, { fallbackToPreviousDay: true })
      .then(setRates);
  }, [date]);

  return (
    <div>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <table>
        <thead>
          <tr>
            <th>Currency</th>
            <th>Unit</th>
            <th>Buy</th>
            <th>Sell</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r) => (
            <tr key={r.currency}>
              <td>
                {r.currencyName} ({r.currency})
              </td>
              <td>{r.unit}</td>
              <td>{r.buy}</td>
              <td>{r.sell}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}`;

export function CurrenciesExample() {
  const [date, setDate] = useState(() => todayIsoLocal());
  const [rates, setRates] = useState<ForexRate[]>([]);
  const [publishedOn, setPublishedOn] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await docsClient().getRatesForDate(date, {
          fallbackToPreviousDay: true,
        });
        if (cancelled) return;
        setRates(rows);
        setPublishedOn(rows[0]?.publishedOn ?? rows[0]?.date ?? null);
      } catch (e) {
        if (!cancelled) {
          setRates([]);
          setPublishedOn(null);
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date]);

  return (
    <div className={panelClass}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-[12px] text-secondary">
          Full NRB list with Buy / Sell ·{" "}
          {publishedOn ? (
            <span className="font-mono text-tertiary">{publishedOn}</span>
          ) : (
            "—"
          )}
          {rates[0]?.isFallback ? " · prior business day" : null}
          {rates.length > 0 ? ` · ${rates.length} currencies` : null}
        </p>
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(controlClass, "font-mono")}
          />
        </Field>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-tertiary">Loading…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : rates.length === 0 ? (
        <p className="mt-3 text-sm text-secondary">No rates for this date.</p>
      ) : (
        <div className={cn(tableShellClass, "mt-4")}>
          <RatesTable rows={rates} />
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}
