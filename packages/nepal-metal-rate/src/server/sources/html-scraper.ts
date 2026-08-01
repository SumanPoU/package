import * as cheerio from "cheerio";
import {
  DEFAULT_SCRAPE_URL,
  DEFAULT_TODAY_URL,
  SERIES_DOMESTIC,
} from "../constants";
import { MetalRateEmptyError, MetalRateSchemaError } from "../errors";
import { fetchText } from "../http/fetch";
import {
  type RateEntry,
  RateEntrySchema,
  type TodayRateItem,
  TodayRateListSchema,
} from "../schema";
import type { RateSource, SourceContext, SourceResult } from "../types";
import { toUtcDateOnly } from "../utils/dates";
import { gmToTola, sanitizeNumericText, tolaToGm } from "../utils/numbers";

export type ScraperSourceOptions = {
  pageUrl?: string;
  todayUrl?: string;
  priority?: number;
};

export const parseRatesFromHtml = (
  html: string,
  fetchedAt: Date,
): RateEntry[] => {
  const $ = cheerio.load(html);
  const entries: RateEntry[] = [];
  const today = toUtcDateOnly(fetchedAt);

  const extractNearHeading = (
    headingRe: RegExp,
  ): { value: number; per10g: boolean } | null => {
    let found: { value: number; per10g: boolean } | null = null;
    $("h1, h2, h3, h4, strong, .title, [class*='gold'], [class*='silver']").each(
      (_, el) => {
        if (found) return;
        const heading = $(el).text().replace(/\s+/g, " ").trim();
        if (!headingRe.test(heading)) return;
        const block = $(el).parent().text().replace(/\s+/g, " ");
        const per10g = /per\s*10\s*grams/i.test(block);
        const money = block.match(/(?:Nrs|Rs\.?|रू)\s*([\d,.]+)/i);
        if (!money?.[1]) return;
        const n = sanitizeNumericText(money[1]);
        if (n === null || n <= 0) return;
        found = { value: n, per10g };
      },
    );
    return found;
  };

  const pushMetal = (
    metal: RateEntry["metal"],
    parsed: { value: number; per10g: boolean } | null,
  ) => {
    if (!parsed) return;
    const gmRate = parsed.per10g ? parsed.value / 10 : parsed.value;
    entries.push(
      RateEntrySchema.parse({
        date: today,
        metal,
        series: SERIES_DOMESTIC,
        gmRate,
        tolaRate: gmToTola(gmRate),
        source: "SCRAPE",
        fetchedAt,
      }),
    );
  };

  pushMetal("GOLD", extractNearHeading(/fine\s*gold/i));
  pushMetal(
    "SILVER",
    extractNearHeading(/^silver$|^\s*silver\s*$|silver(?!\s*rate)/i),
  );

  if (entries.length === 0) {
    const text = $("body").text().replace(/\s+/g, " ");
    const goldMatch = text.match(
      /Fine\s*Gold[\s\S]{0,120}?(?:Nrs|Rs\.?|रू)\s*([\d,.]+)/i,
    );
    const silverMatch = text.match(
      /(?:^|[^\w])Silver[\s\S]{0,120}?(?:Nrs|Rs\.?|रू)\s*([\d,.]+)/i,
    );
    const per10g = /per\s*10\s*grams/i.test(text);
    const push = (metal: RateEntry["metal"], raw?: string) => {
      if (!raw) return;
      const n = sanitizeNumericText(raw);
      if (n === null || n <= 0) return;
      const gmRate = per10g ? n / 10 : n;
      entries.push(
        RateEntrySchema.parse({
          date: today,
          metal,
          series: SERIES_DOMESTIC,
          gmRate,
          tolaRate: gmToTola(gmRate),
          source: "SCRAPE",
          fetchedAt,
        }),
      );
    };
    push("GOLD", goldMatch?.[1]);
    push("SILVER", silverMatch?.[1]);
  }

  return entries;
};

const isInternationalOrFx = (rateType: string): boolean => {
  const t = rateType.toLowerCase();
  return (
    t.includes("international") ||
    t.includes("american dollar") ||
    t.includes("dollar")
  );
};

export const parseTodayRates = (
  items: TodayRateItem[],
  fetchedAt: Date,
): RateEntry[] => {
  const dateIso = items[0]?.todayDate;
  const parsedDate = dateIso ? new Date(dateIso) : fetchedAt;
  if (Number.isNaN(parsedDate.getTime())) {
    throw new MetalRateSchemaError(
      "html-scraper",
      "Invalid todayDate from FeNeGoSiDA today endpoint",
    );
  }
  const date = toUtcDateOnly(parsedDate);
  const goldVals: number[] = [];
  const silverVals: number[] = [];

  for (const item of items) {
    const value = item.todayBaseRatePerGram;
    if (!Number.isFinite(value) || value <= 0) continue;
    if (isInternationalOrFx(item.rateType)) continue;
    const type = item.rateType.toLowerCase();
    const mentionsGold = type.includes("gold") || type.includes("सुन");
    const mentionsSilver =
      type.includes("silver") ||
      type.includes("चाँदी") ||
      type.includes("चांदी");
    if (mentionsGold || value >= 50_000) {
      goldVals.push(value);
      continue;
    }
    if (mentionsSilver || (value >= 1_000 && value < 50_000)) {
      silverVals.push(value);
    }
  }

  const pairGmTola = (vals: number[]): { gm: number; tola: number } | null => {
    const unique = [...new Set(vals)].sort((a, b) => a - b);
    if (unique.length >= 2) {
      return { gm: unique[0]!, tola: unique[unique.length - 1]! };
    }
    if (unique.length === 1) {
      const only = unique[0]!;
      return { gm: tolaToGm(only), tola: only };
    }
    return null;
  };

  const entries: RateEntry[] = [];
  const gold = pairGmTola(goldVals);
  const silver = pairGmTola(silverVals);
  if (gold) {
    entries.push(
      RateEntrySchema.parse({
        date,
        metal: "GOLD",
        series: SERIES_DOMESTIC,
        gmRate: gold.gm,
        tolaRate: gold.tola,
        source: "SCRAPE",
        fetchedAt,
      }),
    );
  }
  if (silver) {
    entries.push(
      RateEntrySchema.parse({
        date,
        metal: "SILVER",
        series: SERIES_DOMESTIC,
        gmRate: silver.gm,
        tolaRate: silver.tola,
        source: "SCRAPE",
        fetchedAt,
      }),
    );
  }
  return entries;
};

export const createHtmlScraperSource = (
  options: ScraperSourceOptions = {},
): RateSource => ({
  id: "html-scraper",
  kind: "SCRAPE",
  priority: options.priority ?? 100,
  description:
    "Cheerio scrape of fenegosida.org with Dashboard/today JSON fallback",
  fetch: async (ctx: SourceContext): Promise<SourceResult> => {
    const pageUrl =
      (ctx.config?.scrapeUrl as string | undefined) ??
      options.pageUrl ??
      process.env.FENEGOSIDA_SCRAPE_URL ??
      DEFAULT_SCRAPE_URL;
    const todayUrl =
      (ctx.config?.todayUrl as string | undefined) ??
      options.todayUrl ??
      DEFAULT_TODAY_URL;

    const fetchedAt = new Date();
    const html = await fetchText({
      url: pageUrl,
      fetchImpl: ctx.fetchImpl,
      timeoutMs: ctx.timeoutMs,
      maxRetries: ctx.maxRetries,
      retryBaseMs: ctx.retryBaseMs,
      signal: ctx.signal,
    });

    const htmlEntries = parseRatesFromHtml(html, fetchedAt);
    if (htmlEntries.length > 0) {
      return {
        entries: htmlEntries,
        auditPayload: {
          mode: "html",
          pageUrl,
          entryCount: htmlEntries.length,
        },
      };
    }

    const todayText = await fetchText({
      url: todayUrl,
      fetchImpl: ctx.fetchImpl,
      timeoutMs: ctx.timeoutMs,
      maxRetries: ctx.maxRetries,
      retryBaseMs: ctx.retryBaseMs,
      signal: ctx.signal,
      accept: "application/json",
    });

    let json: unknown;
    try {
      json = JSON.parse(todayText) as unknown;
    } catch {
      throw new MetalRateSchemaError(
        "html-scraper",
        "today endpoint returned non-JSON",
      );
    }

    const parsed = TodayRateListSchema.safeParse(json);
    if (!parsed.success) {
      throw new MetalRateSchemaError(
        "html-scraper",
        `today schema mismatch: ${parsed.error.issues
          .slice(0, 3)
          .map((i) => i.message)
          .join("; ")}`,
        parsed.error.issues,
      );
    }

    const entries = parseTodayRates(parsed.data, fetchedAt);
    if (entries.length === 0) {
      throw new MetalRateEmptyError("html-scraper");
    }

    return {
      entries,
      auditPayload: {
        mode: "today-endpoint",
        todayUrl,
        items: parsed.data.map((row) => ({
          rateType: row.rateType,
          todayDate: row.todayDate,
          todayBaseRatePerGram: row.todayBaseRatePerGram,
        })),
      },
    };
  },
});

export const htmlScraperSource = createHtmlScraperSource();
