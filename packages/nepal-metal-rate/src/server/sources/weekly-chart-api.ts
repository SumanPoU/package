import { DEFAULT_WEEKLY_CHART_URL } from "../constants";
import { MetalRateEmptyError, MetalRateSchemaError } from "../errors";
import { fetchJson } from "../http/fetch";
import { normalizeWeeklyChart } from "../pipeline/normalize";
import { WeeklyChartRateSchema } from "../schema";
import type { RateSource, SourceContext, SourceResult } from "../types";

export type WeeklyChartSourceOptions = {
  url?: string;
  includeInternational?: boolean;
  priority?: number;
};

export const createWeeklyChartApiSource = (
  options: WeeklyChartSourceOptions = {},
): RateSource => ({
  id: "weekly-chart-api",
  kind: "API",
  priority: options.priority ?? 10,
  description:
    "FeNeGoSiDA Dashboard/WeeklyChartRate — rolling domestic gold/silver window",
  fetch: async (ctx: SourceContext): Promise<SourceResult> => {
    const url =
      (ctx.config?.apiUrl as string | undefined) ??
      options.url ??
      process.env.FENEGOSIDA_API_URL ??
      DEFAULT_WEEKLY_CHART_URL;

    const json: unknown = await fetchJson({
      url,
      fetchImpl: ctx.fetchImpl,
      timeoutMs: ctx.timeoutMs,
      maxRetries: ctx.maxRetries,
      retryBaseMs: ctx.retryBaseMs,
      signal: ctx.signal,
    });

    const parsed = WeeklyChartRateSchema.safeParse(json);
    if (!parsed.success) {
      throw new MetalRateSchemaError(
        "weekly-chart-api",
        `schema mismatch: ${parsed.error.issues
          .slice(0, 3)
          .map((i) => i.message)
          .join("; ")}`,
        parsed.error.issues,
      );
    }

    const fetchedAt = new Date();
    const includeInternational =
      (ctx.config?.includeInternational as boolean | undefined) ??
      options.includeInternational ??
      false;

    const entries = normalizeWeeklyChart(parsed.data, "API", fetchedAt, {
      includeInternational,
    });

    if (entries.length === 0) {
      throw new MetalRateEmptyError("weekly-chart-api");
    }

    return {
      entries,
      auditPayload: {
        goldData: parsed.data.goldData,
        silverData: parsed.data.silverData,
        goldInternationalRate: parsed.data.goldInternationalRate,
        silverInternationalRate: parsed.data.silverInternationalRate,
        americanDollarTodayRate: parsed.data.americanDollarTodayRate,
      },
    };
  },
});

export const weeklyChartApiSource = createWeeklyChartApiSource();
