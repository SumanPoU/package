/**
 * @fileoverview Future FeNeGoSiDA endpoint stubs — register when implementing.
 *
 * Known SPA routes (from fenegosida.org assets):
 * - Dashboard/today
 * - Dashboard/WeeklyChartRate?weekmonthyear=
 * - Dashboard/datewisehistory?date=
 * - Dashboard/ratehistory?weekMonthYear=
 * - Dashboard/monthwisehistory?date=
 *
 * Pattern for a new source:
 * ```ts
 * export const createDatewiseHistorySource = (): RateSource => ({
 *   id: "datewise-history-api",
 *   kind: "API",
 *   priority: 20,
 *   description: "…",
 *   async fetch(ctx) { … }
 * });
 * ```
 * Then add it to `createDefaultSources()` or `registry.register(...)`.
 */

import type { RateSource } from "../types";

/**
 * Placeholder ids reserved for upcoming adapters.
 * Not registered by default — implementing them is a follow-up.
 */
export const RESERVED_SOURCE_IDS = [
  "datewise-history-api",
  "rate-history-api",
  "monthwise-history-api",
  "fx-usd-api",
] as const;

export type ReservedSourceId = (typeof RESERVED_SOURCE_IDS)[number];

/** Type-only helper so future PRs keep a consistent factory signature. */
export type SourceFactory = (options?: Record<string, unknown>) => RateSource;
