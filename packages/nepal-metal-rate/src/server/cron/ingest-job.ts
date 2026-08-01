/**
 * Cron entrypoint: ingest → encrypt+upsert → IngestLog.
 */

import { getPrismaClient, logIngestRun, upsertRateEntries } from "../db";
import {
  ingestDailyRates,
  type IngestDailyRatesOptions,
  type IngestResult,
} from "../ingest";

export type RunDailyIngestOptions = IngestDailyRatesOptions & {
  dryRun?: boolean;
};

export type RunDailyIngestResult = IngestResult & {
  upserted: number;
};

export const runDailyIngest = async (
  options: RunDailyIngestOptions = {},
): Promise<RunDailyIngestResult> => {
  const { dryRun, ...ingestOpts } = options;
  const result = await ingestDailyRates(ingestOpts);

  if (dryRun) {
    return { ...result, upserted: 0 };
  }

  const client = getPrismaClient();
  let upserted = 0;

  try {
    if (result.success && result.entries.length > 0) {
      upserted = await upsertRateEntries(result.entries, client);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "upsert failed";
    const failed: IngestResult = {
      ...result,
      success: false,
      errorMsg: result.errorMsg
        ? `${result.errorMsg}; upsert: ${msg}`
        : `upsert: ${msg}`,
    };
    await logIngestRun(
      {
        sourceUsed: failed.sourceUsed,
        success: false,
        errorMsg: failed.errorMsg,
        rawResponse: failed.rawResponse,
      },
      client,
    );
    return { ...failed, upserted: 0 };
  }

  await logIngestRun(
    {
      sourceUsed: result.sourceUsed,
      success: result.success,
      errorMsg: result.errorMsg,
      rawResponse: result.rawResponse,
    },
    client,
  );

  return { ...result, upserted };
};
