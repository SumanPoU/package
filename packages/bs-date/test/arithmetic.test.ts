import { describe, expect, it } from "vitest";

import {
  addDays,
  addMonths,
  addYears,
  daysInBsMonth,
  diffInBsYears,
  diffInDays,
  endOfBsMonth,
  formatBsIso,
  startOfBsMonth,
} from "../src";

describe("arithmetic & calendar", () => {
  it("addDays rolls across variable BS months", () => {
    const start = { year: 2080, month: 1, day: 30 };
    const len = daysInBsMonth(2080, 1);
    const next = addDays(start, len - 30 + 1);
    expect(next.month).toBe(2);
    expect(next.day).toBe(1);
  });

  it("addMonths clamps day to destination length", () => {
    // Pick a date with a high day and move to a shorter month if needed
    const d = { year: 2080, month: 2, day: 32 };
    const max = daysInBsMonth(2080, 2);
    expect(d.day).toBeLessThanOrEqual(max);
    const moved = addMonths({ year: 2080, month: 2, day: max }, 1);
    expect(moved.month).toBe(3);
    expect(moved.day).toBeLessThanOrEqual(
      daysInBsMonth(moved.year, moved.month),
    );
  });

  it("addYears clamps day", () => {
    const d = addYears({ year: 2080, month: 2, day: 32 }, 1);
    expect(d.year).toBe(2081);
    expect(d.day).toBeLessThanOrEqual(daysInBsMonth(2081, 2));
  });

  it("diffInDays is signed and zero for same day", () => {
    expect(diffInDays("2080-01-01", "2080-01-01")).toBe(0);
    expect(diffInDays("2080-01-01", "2080-01-11")).toBe(10);
    expect(diffInDays("2080-01-11", "2080-01-01")).toBe(-10);
  });

  it("diffInBsYears handles anniversary", () => {
    expect(diffInBsYears("2070-01-01", "2080-01-01")).toBe(10);
    expect(diffInBsYears("2070-05-15", "2080-05-14")).toBe(9);
    expect(diffInBsYears("2070-05-15", "2080-05-15")).toBe(10);
    expect(diffInBsYears("2080-01-01", "2070-01-01")).toBe(-10);
  });

  it("start/end of month", () => {
    expect(formatBsIso(startOfBsMonth("2080-05-17"))).toBe("2080-05-01");
    const end = endOfBsMonth("2080-05-01");
    expect(end.day).toBe(daysInBsMonth(2080, 5));
  });
});
