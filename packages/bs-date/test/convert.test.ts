import { describe, expect, it } from "vitest";

import {
  adToBs,
  BsInvalidError,
  BsRangeError,
  bsToAd,
  bsToAdParts,
  formatBsIso,
  isValidBsDate,
} from "../src";

describe("convert", () => {
  it("maps BS epoch 2000-01-01 to AD 1943-04-14", () => {
    expect(bsToAdParts("2000-01-01")).toEqual({
      year: 1943,
      month: 4,
      day: 14,
    });
  });

  it("golden: BS 2080-10-15 → AD 2024-01-29", () => {
    expect(bsToAdParts({ year: 2080, month: 10, day: 15 })).toEqual({
      year: 2024,
      month: 1,
      day: 29,
    });
  });

  it("golden: AD 2025-04-14 → BS 2082-01-01", () => {
    expect(adToBs({ year: 2025, month: 4, day: 14 })).toEqual({
      year: 2082,
      month: 1,
      day: 1,
    });
  });

  it("round-trips across month/year edges", () => {
    const samples = [
      "2000-01-01",
      "2079-12-30",
      "2080-01-01",
      "2080-10-15",
      "2082-01-01",
      "2090-06-15",
      "2100-12-01",
    ];
    for (const s of samples) {
      const ad = bsToAd(s);
      const back = adToBs(ad);
      expect(formatBsIso(back)).toBe(s);
    }
  });

  it("accepts Date and string for adToBs", () => {
    const fromParts = adToBs({ year: 2024, month: 1, day: 29 });
    const fromDate = adToBs(new Date(2024, 0, 29));
    const fromStr = adToBs("2024-01-29");
    expect(fromParts).toEqual(fromDate);
    expect(fromParts).toEqual(fromStr);
  });

  it("rejects out-of-range AD", () => {
    expect(() => adToBs({ year: 1800, month: 1, day: 1 })).toThrow(
      BsRangeError,
    );
  });

  it("isValidBsDate", () => {
    expect(isValidBsDate("2082-01-01")).toBe(true);
    expect(isValidBsDate("2082-13-01")).toBe(false);
    expect(isValidBsDate({ year: 2082, month: 1, day: 99 })).toBe(false);
    expect(isValidBsDate(null)).toBe(false);
  });

  it("throws typed error for invalid BS day count", () => {
    expect(() => bsToAd({ year: 2082, month: 1, day: 99 })).toThrow(
      BsInvalidError,
    );
  });
});
