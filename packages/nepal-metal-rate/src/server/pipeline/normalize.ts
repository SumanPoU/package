import { SERIES_DOMESTIC, SERIES_INTERNATIONAL } from "../constants";
import { MetalRateValidationError } from "../errors";
import {
  type ApiDayPoint,
  type Metal,
  type RateEntry,
  RateEntrySchema,
  type Source,
} from "../schema";
import { parseApiChartDate } from "../utils/dates";

export const chartPointsToEntries = (
  points: ApiDayPoint[],
  metal: Metal,
  source: Source,
  fetchedAt: Date,
  series: string = SERIES_DOMESTIC,
): RateEntry[] => {
  const out: RateEntry[] = [];
  for (const point of points) {
    if (point.gm <= 0 && point.tola <= 0) continue;
    out.push(
      RateEntrySchema.parse({
        date: parseApiChartDate(point),
        metal,
        series,
        gmRate: point.gm,
        tolaRate: point.tola,
        source,
        fetchedAt,
      }),
    );
  }
  return out;
};

export const normalizeWeeklyChart = (
  data: {
    goldData: ApiDayPoint[];
    silverData: ApiDayPoint[];
    goldInternationalRate?: ApiDayPoint[];
    silverInternationalRate?: ApiDayPoint[];
  },
  source: Source,
  fetchedAt: Date,
  options?: { includeInternational?: boolean },
): RateEntry[] => {
  const entries = [
    ...chartPointsToEntries(data.goldData, "GOLD", source, fetchedAt),
    ...chartPointsToEntries(data.silverData, "SILVER", source, fetchedAt),
  ];

  if (options?.includeInternational) {
    if (data.goldInternationalRate?.length) {
      entries.push(
        ...chartPointsToEntries(
          data.goldInternationalRate,
          "GOLD",
          source,
          fetchedAt,
          SERIES_INTERNATIONAL,
        ),
      );
    }
    if (data.silverInternationalRate?.length) {
      entries.push(
        ...chartPointsToEntries(
          data.silverInternationalRate,
          "SILVER",
          source,
          fetchedAt,
          SERIES_INTERNATIONAL,
        ),
      );
    }
  }

  return entries;
};

export const validateEntries = (entries: RateEntry[]): RateEntry[] => {
  const out: RateEntry[] = [];
  for (const entry of entries) {
    const parsed = RateEntrySchema.safeParse(entry);
    if (!parsed.success) {
      throw new MetalRateValidationError(
        `Normalized RateEntry failed validation: ${parsed.error.issues
          .map((i) => i.message)
          .join("; ")}`,
      );
    }
    out.push(parsed.data);
  }
  return out;
};
