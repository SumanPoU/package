/**
 * @fileoverview Prisma persistence with encrypt-at-rest for rate amounts.
 */

import { PrismaClient } from "@prisma/client";
import { SERIES_DOMESTIC } from "../constants";
import type { PublicRate } from "../contract/api";
import {
  decryptMoney,
  encryptMoney,
  maskRateForLog,
  rowIntegrityHash,
  verifyRowIntegrity,
} from "./crypto";
import { sanitizeForStorage } from "./sanitize";
import type { IngestLogInput, Metal, RateEntry } from "./schema/rate-entry";

export { sanitizeForStorage } from "./sanitize";
export { maskRateForLog } from "./crypto";

const globalForPrisma = globalThis as unknown as {
  __itzsaNepalMetalRatePrisma?: PrismaClient;
};

export const getPrismaClient = (): PrismaClient => {
  if (!globalForPrisma.__itzsaNepalMetalRatePrisma) {
    globalForPrisma.__itzsaNepalMetalRatePrisma = new PrismaClient();
  }
  return globalForPrisma.__itzsaNepalMetalRatePrisma;
};

export const setPrismaClient = (client: PrismaClient): void => {
  globalForPrisma.__itzsaNepalMetalRatePrisma = client;
};

const dateIso = (d: Date): string => d.toISOString().slice(0, 10);

const decryptRow = (row: {
  date: Date;
  metal: Metal;
  series: string;
  gmRateEnc: string;
  gmRateIntegrity: string;
  tolaRateEnc: string;
  tolaRateIntegrity: string;
  rowIntegrity: string;
  fetchedAt: Date;
}): PublicRate => {
  const gmRate = decryptMoney(row.gmRateEnc, row.gmRateIntegrity);
  const tolaRate = decryptMoney(row.tolaRateEnc, row.tolaRateIntegrity);
  const ok = verifyRowIntegrity(
    {
      dateIso: dateIso(row.date),
      metal: row.metal,
      series: row.series,
      gmRate,
      tolaRate,
    },
    row.rowIntegrity,
  );
  if (!ok) {
    throw new Error("Rate row failed integrity verification");
  }
  return {
    date: dateIso(row.date),
    metal: row.metal,
    series: row.series,
    gmRate,
    tolaRate,
    fetchedAt: row.fetchedAt.toISOString(),
  };
};

/** Encrypt + upsert. Plaintext amounts never written to Postgres. */
export const upsertRateEntries = async (
  entries: RateEntry[],
  client: PrismaClient = getPrismaClient(),
): Promise<number> => {
  let count = 0;
  for (const entry of entries) {
    const series = entry.series ?? SERIES_DOMESTIC;
    const gmRate = entry.gmRate;
    const tolaRate = entry.tolaRate;
    const gm = encryptMoney(gmRate);
    const tola = encryptMoney(tolaRate);
    const integrity = rowIntegrityHash({
      dateIso: dateIso(entry.date),
      metal: entry.metal,
      series,
      gmRate,
      tolaRate,
    });

    await client.rateEntry.upsert({
      where: {
        date_metal_series: {
          date: entry.date,
          metal: entry.metal,
          series,
        },
      },
      create: {
        date: entry.date,
        metal: entry.metal,
        series,
        gmRateEnc: gm.ciphertext,
        gmRateIntegrity: gm.integrity,
        tolaRateEnc: tola.ciphertext,
        tolaRateIntegrity: tola.integrity,
        rowIntegrity: integrity,
        source: entry.source,
        fetchedAt: entry.fetchedAt,
      },
      update: {
        gmRateEnc: gm.ciphertext,
        gmRateIntegrity: gm.integrity,
        tolaRateEnc: tola.ciphertext,
        tolaRateIntegrity: tola.integrity,
        rowIntegrity: integrity,
        source: entry.source,
        fetchedAt: entry.fetchedAt,
      },
    });
    count += 1;
  }
  return count;
};

export const logIngestRun = async (
  result: IngestLogInput,
  client: PrismaClient = getPrismaClient(),
): Promise<void> => {
  await client.ingestLog.create({
    data: {
      sourceUsed: result.sourceUsed,
      success: result.success,
      errorMsg: result.errorMsg ?? null,
      rawResponse:
        result.rawResponse === undefined
          ? undefined
          : sanitizeForStorage(result.rawResponse),
    },
  });
};

export type RateQueryOptions = {
  series?: string;
  client?: PrismaClient;
};

/** Decrypt for API responses only — never return ciphertext. */
export const getLatestRate = async (
  metal: Metal,
  options: RateQueryOptions = {},
): Promise<PublicRate | null> => {
  const client = options.client ?? getPrismaClient();
  const row = await client.rateEntry.findFirst({
    where: {
      metal,
      series: options.series ?? SERIES_DOMESTIC,
    },
    orderBy: { date: "desc" },
  });
  if (!row) return null;
  return decryptRow(row);
};

export const getRateHistory = async (
  metal: Metal,
  from: Date,
  to: Date,
  options: RateQueryOptions = {},
): Promise<PublicRate[]> => {
  const client = options.client ?? getPrismaClient();
  const rows = await client.rateEntry.findMany({
    where: {
      metal,
      series: options.series ?? SERIES_DOMESTIC,
      date: { gte: from, lte: to },
    },
    orderBy: { date: "asc" },
  });
  return rows.map(decryptRow);
};
