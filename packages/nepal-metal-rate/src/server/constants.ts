/**
 * @fileoverview Server-only FeNeGoSiDA / ingest constants.
 */

export const DEFAULT_WEEKLY_CHART_URL =
  "https://api.fenegosida.org/api/website/v1/Dashboard/WeeklyChartRate?weekmonthyear=7";

export const DEFAULT_SCRAPE_URL = "https://www.fenegosida.org/";

export const DEFAULT_TODAY_URL =
  "https://api.fenegosida.org/api/website/v1/Dashboard/today";

export const DEFAULT_USER_AGENT =
  "itzsa-nepal-metal-rate/0.0.0 (+https://itzsa.acharya-suman.com.np)";

export const DEFAULT_TIMEOUT_MS = 15_000;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_RETRY_BASE_MS = 200;
export const GRAMS_PER_TOLA = 11.6638;

export {
  SERIES_DOMESTIC,
  SERIES_FX_USD,
  SERIES_INTERNATIONAL,
} from "../constants";
