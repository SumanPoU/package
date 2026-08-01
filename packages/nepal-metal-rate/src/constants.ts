/**
 * @fileoverview Public package constants (client-safe).
 * FeNeGoSiDA upstream URLs live under `server/` only.
 */

/** Default itzsa-hosted metal-rate API (v1). Override via `baseUrl`. */
export const DEFAULT_API_BASE_URL =
  "https://itzsa.acharya-suman.com.np/api/nepal-metal-rate/v1";

export const DEFAULT_TIMEOUT_MS = 15_000;

export {
  SERIES_DOMESTIC,
  SERIES_FX_USD,
  SERIES_INTERNATIONAL,
} from "./contract/api";
