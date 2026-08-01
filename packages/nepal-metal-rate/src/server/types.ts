/**
 * @fileoverview Server pipeline / source plugin types.
 */

import type { RateEntry, Source } from "./schema/rate-entry";

export type FetchLike = typeof globalThis.fetch;

export type MetalRateLogger = (
  message: string,
  meta?: Record<string, unknown>,
) => void;

export type SourceContext = {
  fetchImpl: FetchLike;
  timeoutMs: number;
  maxRetries: number;
  retryBaseMs: number;
  signal?: AbortSignal;
  log: MetalRateLogger;
  config?: Record<string, unknown>;
};

export type SourceResult = {
  entries: RateEntry[];
  auditPayload: unknown;
};

export type RateSource = {
  readonly id: string;
  readonly kind: Source;
  readonly priority: number;
  readonly description?: string;
  fetch: (ctx: SourceContext) => Promise<SourceResult>;
};

export type IngestResult = {
  success: boolean;
  sourceUsed: Source;
  sourceId: string;
  entries: RateEntry[];
  errorMsg?: string;
  rawResponse?: unknown;
  durationMs: number;
  attempts: ReadonlyArray<{
    sourceId: string;
    kind: Source;
    ok: boolean;
    error?: string;
    durationMs: number;
  }>;
};
