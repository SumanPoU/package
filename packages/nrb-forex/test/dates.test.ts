import { describe, expect, it } from "vitest";

import {
  cacheTtlMsForDate,
  formatNstDate,
  recommendedRevalidateSeconds,
  TODAY_SOFT_TTL_MS,
} from "../src/dates";

describe("cacheTtlMsForDate", () => {
  it("caches past NST days forever", () => {
    expect(cacheTtlMsForDate("2020-01-01")).toBeNull();
  });

  it("uses soft TTL for today NST", () => {
    const today = formatNstDate(new Date());
    expect(cacheTtlMsForDate(today)).toBe(TODAY_SOFT_TTL_MS);
  });

  it("uses soft TTL for future days", () => {
    expect(cacheTtlMsForDate("2099-01-01")).toBe(TODAY_SOFT_TTL_MS);
  });
});

describe("recommendedRevalidateSeconds", () => {
  it("is long for historical ranges", () => {
    expect(recommendedRevalidateSeconds("2026-01-01", "2026-01-02")).toBe(
      7 * 24 * 60 * 60,
    );
  });

  it("is soft when range includes today", () => {
    const today = formatNstDate(new Date());
    expect(recommendedRevalidateSeconds(today, today)).toBe(
      TODAY_SOFT_TTL_MS / 1000,
    );
  });
});
