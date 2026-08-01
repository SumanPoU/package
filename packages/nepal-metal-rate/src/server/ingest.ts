/**
 * High-level ingest — source chain, soft-fail.
 */

import { runSourceChain, type RunSourceChainOptions } from "./pipeline/runner";
import type { IngestResult } from "./types";

export type IngestDailyRatesOptions = RunSourceChainOptions;
export type { IngestResult };

export const ingestDailyRates = async (
  options: IngestDailyRatesOptions = {},
): Promise<IngestResult> => runSourceChain(options);
