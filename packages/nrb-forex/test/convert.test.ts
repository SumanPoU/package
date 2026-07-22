import { describe, expect, it } from "vitest";
import type { ForexRate } from "../src";
import { convertAmount, convertFromNpr, perUnitRates } from "../src";

const inr: ForexRate = {
  currency: "INR",
  currencyName: "Indian Rupee",
  unit: 100,
  buy: 160,
  sell: 160.15,
  date: "2026-07-17",
  publishedOn: "2026-07-17 00:00:06",
};

const jpy: ForexRate = {
  currency: "JPY",
  currencyName: "Japanese Yen",
  unit: 10,
  buy: 9.49,
  sell: 9.52,
  date: "2026-07-17",
  publishedOn: "2026-07-17 00:00:06",
};

describe("convert / unit normalization", () => {
  it("perUnitRates divides by unit", () => {
    expect(perUnitRates(inr).buy).toBeCloseTo(1.6, 10);
    expect(perUnitRates(jpy).mid).toBeCloseTo((0.949 + 0.952) / 2, 10);
  });

  it("convertAmount uses buy/sell/mid with unit", () => {
    expect(convertAmount(100, inr, "buy")).toBeCloseTo(160, 10);
    expect(convertAmount(100, inr, "sell")).toBeCloseTo(160.15, 10);
    expect(convertAmount(10, jpy, "buy")).toBeCloseTo(9.49, 10);
  });

  it("convertFromNpr is inverse", () => {
    const npr = convertAmount(50, inr, "mid");
    const back = convertFromNpr(npr, inr, "mid");
    expect(back).toBeCloseTo(50, 10);
  });
});
