/**
 * @fileoverview Server entry — ingest, encrypt-at-rest DB, cron helpers.
 *
 * Import from `@itzsa/nepal-metal-rate/server` in Node/cron/API routes only.
 * Browser packages should use `@itzsa/nepal-metal-rate` (HTTP client).
 */

export {
  getLatestRate,
  getPrismaClient,
  getRateHistory,
  logIngestRun,
  maskRateForLog,
  sanitizeForStorage,
  setPrismaClient,
  upsertRateEntries,
  type RateQueryOptions,
} from "./db";

export {
  encryptMoney,
  decryptMoney,
  rowIntegrityHash,
  verifyRowIntegrity,
} from "./crypto";

export {
  ingestDailyRates,
  type IngestDailyRatesOptions,
  type IngestResult,
} from "./ingest";

export {
  runDailyIngest,
  type RunDailyIngestOptions,
  type RunDailyIngestResult,
} from "./cron/ingest-job";

export {
  createSourceRegistry,
  createDefaultSources,
  runSourceChain,
  chartPointsToEntries,
  normalizeWeeklyChart,
  validateEntries,
  type SourceRegistry,
  type RunSourceChainOptions,
  type DefaultSourceOptions,
} from "./pipeline";

export {
  createWeeklyChartApiSource,
  createHtmlScraperSource,
  weeklyChartApiSource,
  htmlScraperSource,
  parseRatesFromHtml,
  parseTodayRates,
  RESERVED_SOURCE_IDS,
  DEFAULT_WEEKLY_CHART_URL,
  DEFAULT_SCRAPE_URL,
  DEFAULT_TODAY_URL,
} from "./sources";

export {
  MetalSchema,
  RateEntrySchema,
  SourceSchema,
  type Metal,
  type RateEntry,
  type Source,
  type IngestLogInput,
} from "./schema";

export type { RateSource, SourceContext, SourceResult } from "./types";

export {
  MetalRateEmptyError,
  MetalRateSchemaError,
  toErrorMessage,
} from "./errors";
