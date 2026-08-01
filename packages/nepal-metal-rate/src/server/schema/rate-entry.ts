/**
 * @fileoverview Server schema — normalized RateEntry before encryption.
 */

import { z } from "zod";
import { SERIES_DOMESTIC } from "../constants";

export const MetalSchema = z.enum(["GOLD", "SILVER"]);
export type Metal = z.infer<typeof MetalSchema>;

export const SourceSchema = z.enum(["API", "SCRAPE"]);
export type Source = z.infer<typeof SourceSchema>;

export const SeriesSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Z][A-Z0-9_]*$/)
  .default(SERIES_DOMESTIC);
export type Series = z.infer<typeof SeriesSchema>;

/** In-memory plaintext row (never write these numbers to DB as plaintext). */
export const RateEntrySchema = z.object({
  date: z.date(),
  metal: MetalSchema,
  series: SeriesSchema,
  gmRate: z.number().finite().nonnegative(),
  tolaRate: z.number().finite().nonnegative(),
  source: SourceSchema,
  fetchedAt: z.date(),
});
export type RateEntry = z.infer<typeof RateEntrySchema>;

export const IngestLogInputSchema = z.object({
  sourceUsed: SourceSchema,
  success: z.boolean(),
  errorMsg: z.string().optional(),
  rawResponse: z.unknown().optional(),
});
export type IngestLogInput = z.infer<typeof IngestLogInputSchema>;
