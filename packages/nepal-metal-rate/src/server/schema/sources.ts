/**
 * @fileoverview Zod schemas for FeNeGoSiDA upstream payloads.
 *
 * Keep one schema family per upstream contract. New endpoints → new schema
 * exports here, then a `RateSource` adapter under `sources/`.
 */

import { z } from "zod";

/** One day point from WeeklyChartRate (and similar chart endpoints). */
export const ApiDayPointSchema = z.object({
  date: z.union([z.string(), z.number()]).transform(String),
  year: z.union([z.string(), z.number()]).transform(String),
  month: z.string().min(1),
  day: z.string().optional(),
  gm: z.coerce.number().finite(),
  tola: z.coerce.number().finite(),
});
export type ApiDayPoint = z.infer<typeof ApiDayPointSchema>;

/** Undocumented WeeklyChartRate response. */
export const WeeklyChartRateSchema = z.object({
  goldData: z.array(ApiDayPointSchema).min(1),
  silverData: z.array(ApiDayPointSchema).min(1),
  goldInternationalRate: z.array(ApiDayPointSchema).optional(),
  silverInternationalRate: z.array(ApiDayPointSchema).optional(),
  americanDollarTodayRate: z.array(ApiDayPointSchema).optional(),
});
export type WeeklyChartRate = z.infer<typeof WeeklyChartRateSchema>;

/** Website `Dashboard/today` row (field names match upstream spelling). */
export const TodayRateItemSchema = z.object({
  id: z.number().optional(),
  todayDate: z.string(),
  yestardayDate: z.string().optional(),
  rateType: z.string(),
  todayBaseRatePerGram: z.coerce.number().finite(),
  yestardayBaseRatePerGram: z.coerce.number().finite().optional(),
});
export type TodayRateItem = z.infer<typeof TodayRateItemSchema>;

export const TodayRateListSchema = z.array(TodayRateItemSchema).min(1);
