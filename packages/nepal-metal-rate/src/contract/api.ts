/**
 * @fileoverview Public API contract — what our backend serves and what
 * compatible third-party APIs must implement for the npm client.
 *
 * Package consumers never talk to FeNeGoSiDA. They call:
 *   - default: itzsa hosted API
 *   - or: their own `baseUrl` implementing this contract
 */

import { z } from "zod";

export const MetalSchema = z.enum(["GOLD", "SILVER"]);
export type Metal = z.infer<typeof MetalSchema>;

export const SERIES_DOMESTIC = "DOMESTIC";
export const SERIES_INTERNATIONAL = "INTERNATIONAL";
export const SERIES_FX_USD = "FX_USD";

export const SeriesSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Z][A-Z0-9_]*$/)
  .default(SERIES_DOMESTIC);
export type Series = z.infer<typeof SeriesSchema>;

/** Decrypted rate row returned by the public HTTP API (never ciphertext). */
export const PublicRateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  metal: MetalSchema,
  series: z.string().min(1),
  gmRate: z.number().finite().nonnegative(),
  tolaRate: z.number().finite().nonnegative(),
  fetchedAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
});
export type PublicRate = z.infer<typeof PublicRateSchema>;

export const ApiOkLatestSchema = z.object({
  ok: z.literal(true),
  data: PublicRateSchema.nullable(),
});

export const ApiOkHistorySchema = z.object({
  ok: z.literal(true),
  data: z.array(PublicRateSchema),
});

export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.string().optional(),
});

export type ApiLatestResponse = z.infer<typeof ApiOkLatestSchema> | z.infer<typeof ApiErrorSchema>;
export type ApiHistoryResponse =
  | z.infer<typeof ApiOkHistorySchema>
  | z.infer<typeof ApiErrorSchema>;
