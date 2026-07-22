import { createNrbForexClient, NrbForexClient } from "../client";
import type {
  DailyForexSnapshot,
  ForexRate,
  NrbForexClientOptions,
} from "../types";

export type SyncWriter = (snapshot: DailyForexSnapshot) => Promise<void> | void;

export type NightlySyncOptions = NrbForexClientOptions & {
  /** Date to sync (default: today UTC). */
  date?: Date | string;
  /** Persist callback — e.g. upsert into Redis/DB. */
  write: SyncWriter;
  /** If true, use fallbackToPreviousDay when today has no rates. */
  fallbackToPreviousDay?: boolean;
};

/**
 * Helper for nightly cron jobs: fetch one day's snapshot and hand it to `write`.
 * Core client stays fetch-only; persistence is the caller's concern.
 */
export async function syncDailyRates(
  options: NightlySyncOptions,
): Promise<DailyForexSnapshot> {
  const { write, date, fallbackToPreviousDay, ...clientOpts } = options;
  const client = createNrbForexClient({
    ...clientOpts,
    fallbackToPreviousDay: fallbackToPreviousDay ?? true,
  });
  const rates = await client.getRatesForDate(date, {
    fallbackToPreviousDay: fallbackToPreviousDay ?? true,
  });
  if (rates.length === 0) {
    throw new Error("syncDailyRates: empty rate list");
  }
  const snapshot: DailyForexSnapshot = {
    date: rates[0]!.date,
    publishedOn: rates[0]!.publishedOn,
    modifiedOn: rates[0]!.publishedOn,
    rates,
  };
  await write(snapshot);
  return snapshot;
}

export { NrbForexClient, createNrbForexClient };
export type { DailyForexSnapshot, ForexRate };
