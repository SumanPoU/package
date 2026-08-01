import {
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_BASE_MS,
  DEFAULT_TIMEOUT_MS,
} from "../constants";
import { toErrorMessage } from "../errors";
import {
  createDefaultSources,
  type DefaultSourceOptions,
} from "../sources";
import type {
  FetchLike,
  IngestResult,
  MetalRateLogger,
  SourceContext,
} from "../types";
import { defaultLogger } from "../utils/logger";
import { validateEntries } from "./normalize";
import { createSourceRegistry, type SourceRegistry } from "./registry";

export type RunSourceChainOptions = DefaultSourceOptions & {
  registry?: SourceRegistry;
  sourceIds?: string[];
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseMs?: number;
  signal?: AbortSignal;
  log?: MetalRateLogger;
  sourceConfig?: Record<string, unknown>;
};

export const runSourceChain = async (
  options: RunSourceChainOptions = {},
): Promise<IngestResult> => {
  const log = options.log ?? defaultLogger;
  const started = Date.now();
  const registry =
    options.registry ?? createSourceRegistry(createDefaultSources(options));

  let sources = registry.list();
  if (options.sourceIds?.length) {
    const allow = new Set(options.sourceIds);
    sources = sources.filter((s) => allow.has(s.id));
  }

  const ctx: SourceContext = {
    fetchImpl: options.fetchImpl ?? globalThis.fetch,
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    maxRetries: options.maxRetries ?? DEFAULT_MAX_RETRIES,
    retryBaseMs: options.retryBaseMs ?? DEFAULT_RETRY_BASE_MS,
    signal: options.signal,
    log,
    config: {
      apiUrl: options.apiUrl,
      scrapeUrl: options.scrapeUrl,
      todayUrl: options.todayUrl,
      includeInternational: options.includeInternational,
      ...options.sourceConfig,
    },
  };

  const attempts: Array<IngestResult["attempts"][number]> = [];
  let lastSourceId = sources[0]?.id ?? "none";
  let lastKind = sources[0]?.kind ?? "API";

  for (const source of sources) {
    lastSourceId = source.id;
    lastKind = source.kind;
    const attemptStarted = Date.now();
    try {
      const result = await source.fetch(ctx);
      const entries = validateEntries(result.entries);
      if (entries.length === 0) {
        throw new Error("empty entries after validation");
      }
      const durationMs = Date.now() - attemptStarted;
      attempts.push({
        sourceId: source.id,
        kind: source.kind,
        ok: true,
        durationMs,
      });
      const totalMs = Date.now() - started;
      log("ingest served by source", {
        sourceId: source.id,
        source: source.kind,
        recordCount: entries.length,
        durationMs: totalMs,
      });
      return {
        success: true,
        sourceUsed: source.kind,
        sourceId: source.id,
        entries,
        rawResponse: result.auditPayload,
        durationMs: totalMs,
        attempts,
      };
    } catch (err) {
      const error = toErrorMessage(err);
      attempts.push({
        sourceId: source.id,
        kind: source.kind,
        ok: false,
        error,
        durationMs: Date.now() - attemptStarted,
      });
      log("source failed; trying next", { sourceId: source.id, error });
    }
  }

  const durationMs = Date.now() - started;
  const errorMsg = attempts
    .map((a) => `${a.sourceId}: ${a.error ?? "ok"}`)
    .join("; ");
  log("ingest failed (all sources)", {
    recordCount: 0,
    durationMs,
    error: errorMsg,
  });

  return {
    success: false,
    sourceUsed: lastKind,
    sourceId: lastSourceId,
    entries: [],
    errorMsg,
    durationMs,
    attempts,
  };
};
