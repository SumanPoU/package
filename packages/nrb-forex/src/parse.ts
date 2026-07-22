import { NrbApiError } from "./errors";
import type {
  DailyForexSnapshot,
  ForexRate,
  NrbRawPayloadDay,
  NrbRawRate,
} from "./types";

const MONEY_RE = /^\d+(\.\d+)?$/;

/**
 * Parse NRB money strings safely.
 * Rejects empty, NaN, scientific notation, and non-numeric junk.
 */
export function parseMoneyString(raw: unknown, field: string): number {
  if (typeof raw !== "string") {
    throw new NrbApiError(
      `Malformed ${field}: expected string, got ${typeof raw}`,
    );
  }
  const trimmed = raw.trim();
  if (!MONEY_RE.test(trimmed)) {
    throw new NrbApiError(`Malformed ${field} value ${JSON.stringify(raw)}`);
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new NrbApiError(`Non-finite ${field} value ${JSON.stringify(raw)}`);
  }
  return n;
}

export function parseRawRate(
  raw: NrbRawRate,
  date: string,
  publishedOn: string,
): ForexRate {
  const unit = raw.currency?.unit;
  if (typeof unit !== "number" || !Number.isFinite(unit) || unit <= 0) {
    throw new NrbApiError(
      `Invalid currency unit for ${raw.currency?.iso3 ?? "?"} on ${date}`,
    );
  }
  const iso3 = raw.currency?.iso3;
  if (typeof iso3 !== "string" || !iso3) {
    throw new NrbApiError(`Missing currency iso3 on ${date}`);
  }
  return {
    currency: iso3.toUpperCase(),
    currencyName: raw.currency.name ?? iso3,
    unit,
    buy: parseMoneyString(raw.buy, "buy"),
    sell: parseMoneyString(raw.sell, "sell"),
    date,
    publishedOn,
  };
}

export function parsePayloadDay(day: NrbRawPayloadDay): DailyForexSnapshot {
  if (typeof day.date !== "string" || !day.date) {
    throw new NrbApiError("Payload day missing date");
  }
  const rates = (day.rates ?? []).map((r) =>
    parseRawRate(r, day.date, day.published_on ?? day.date),
  );
  return {
    date: day.date,
    publishedOn: day.published_on ?? day.date,
    modifiedOn: day.modified_on ?? day.published_on ?? day.date,
    rates,
  };
}

/** Per-1-unit NPR rates (buy/sell divided by published unit). */
export function perUnitRates(rate: ForexRate): {
  buy: number;
  sell: number;
  mid: number;
} {
  const buy = rate.buy / rate.unit;
  const sell = rate.sell / rate.unit;
  return { buy, sell, mid: (buy + sell) / 2 };
}
