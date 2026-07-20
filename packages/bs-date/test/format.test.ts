import { describe, expect, it } from "vitest";

import {
  formatBs,
  getBsMonthName,
  getBsWeekday,
  isSaturday,
  toNepaliNumerals,
} from "../src";

describe("format", () => {
  it("formats ISO and long patterns", () => {
    const d = { year: 2082, month: 1, day: 5 };
    expect(formatBs(d, "YYYY-MM-DD")).toBe("2082-01-05");
    expect(formatBs(d, "DD MMMM YYYY")).toBe("05 Baisakh 2082");
    expect(formatBs(d, "DD MMMM YYYY", { locale: "ne" })).toBe(
      "05 बैशाख 2082",
    );
  });

  it("toNepaliNumerals", () => {
    expect(toNepaliNumerals(2082)).toBe("२०८२");
    expect(toNepaliNumerals("12-3")).toBe("१२-३");
  });

  it("formatBs with nepaliDigits", () => {
    expect(
      formatBs("2082-01-05", "YYYY-MM-DD", { nepaliDigits: true }),
    ).toBe("२०८२-०१-०५");
  });

  it("getBsMonthName", () => {
    expect(getBsMonthName(1, "en")).toBe("Baisakh");
    expect(getBsMonthName(1, "ne")).toBe("बैशाख");
  });
});

describe("weekday", () => {
  it("getBsWeekday / isSaturday", () => {
    const wd = getBsWeekday("2082-01-01");
    expect(wd).toBeGreaterThanOrEqual(0);
    expect(wd).toBeLessThanOrEqual(6);
    expect(isSaturday("2082-01-01")).toBe(wd === 6);
  });
});
