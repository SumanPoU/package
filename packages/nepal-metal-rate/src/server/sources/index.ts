import type { RateSource } from "../types";
import {
  createHtmlScraperSource,
  type ScraperSourceOptions,
} from "./html-scraper";
import {
  createWeeklyChartApiSource,
  type WeeklyChartSourceOptions,
} from "./weekly-chart-api";

export type DefaultSourceOptions = {
  apiUrl?: string;
  url?: string;
  scrapeUrl?: string;
  pageUrl?: string;
  todayUrl?: string;
  includeInternational?: boolean;
  api?: WeeklyChartSourceOptions;
  scrape?: ScraperSourceOptions;
};

export const createDefaultSources = (
  options: DefaultSourceOptions = {},
): RateSource[] => [
  createWeeklyChartApiSource({
    url: options.api?.url ?? options.apiUrl ?? options.url,
    includeInternational:
      options.api?.includeInternational ?? options.includeInternational,
    priority: options.api?.priority,
  }),
  createHtmlScraperSource({
    pageUrl: options.scrape?.pageUrl ?? options.scrapeUrl ?? options.pageUrl,
    todayUrl: options.scrape?.todayUrl ?? options.todayUrl,
    priority: options.scrape?.priority,
  }),
];

export {
  createHtmlScraperSource,
  htmlScraperSource,
  parseRatesFromHtml,
  parseTodayRates,
} from "./html-scraper";
export {
  createWeeklyChartApiSource,
  weeklyChartApiSource,
} from "./weekly-chart-api";
export { RESERVED_SOURCE_IDS, type ReservedSourceId } from "./future";
export {
  DEFAULT_SCRAPE_URL,
  DEFAULT_TODAY_URL,
  DEFAULT_WEEKLY_CHART_URL,
} from "../constants";
