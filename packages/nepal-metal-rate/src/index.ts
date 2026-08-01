/**
 * @fileoverview Public entry — HTTP client for itzsa (or compatible) metal-rate API.
 *
 * Ingestion, encryption, Prisma, and FeNeGoSiDA scraping live in
 * `@itzsa/nepal-metal-rate/server` (Node / cron only).
 */

export {
  createMetalRateClient,
  getDefaultClient,
  getLatestRate,
  getRateHistory,
  setDefaultClient,
  type HistoryQuery,
  type LatestQuery,
  type MetalRateClient,
  type MetalRateClientOptions,
} from "./client";

export {
  DEFAULT_API_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  SERIES_DOMESTIC,
  SERIES_FX_USD,
  SERIES_INTERNATIONAL,
} from "./constants";

export {
  ApiErrorSchema,
  ApiOkHistorySchema,
  ApiOkLatestSchema,
  MetalSchema,
  PublicRateSchema,
  SeriesSchema,
  type ApiHistoryResponse,
  type ApiLatestResponse,
  type Metal,
  type PublicRate,
  type Series,
} from "./contract/api";

export {
  MetalRateError,
  MetalRateHttpError,
  MetalRateNotFoundError,
  MetalRateValidationError,
} from "./errors";
