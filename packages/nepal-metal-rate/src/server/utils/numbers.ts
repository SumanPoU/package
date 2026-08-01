import { GRAMS_PER_TOLA } from "../constants";

export const sanitizeNumericText = (raw: string): number | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/[^\d.-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") {
    return null;
  }
  const n = Number.parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
};

export const roundMoney = (n: number): number => Math.round(n * 100) / 100;

export const tolaToGm = (tola: number): number =>
  roundMoney(tola / GRAMS_PER_TOLA);

export const gmToTola = (gm: number): number =>
  roundMoney(gm * GRAMS_PER_TOLA);
