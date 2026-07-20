import { afterEach, describe, expect, it } from "vitest";

import {
  extendHolidayCalendar,
  getHolidayName,
  getHolidaysInMonth,
  isPublicHoliday,
  resetHolidayCalendar,
  setHolidayCalendar,
} from "../src";

describe("holidays", () => {
  afterEach(() => {
    resetHolidayCalendar();
  });

  it("detects recurring New Year", () => {
    expect(isPublicHoliday("2082-01-01")).toBe(true);
    expect(getHolidayName("2082-01-01", "en")).toMatch(/New Year/i);
    expect(getHolidayName("2082-01-01", "ne")).toBeTruthy();
  });

  it("lists holidays in a month", () => {
    const list = getHolidaysInMonth(2082, 1);
    expect(list.some((h) => h.day === 1)).toBe(true);
  });

  it("supports override calendar", () => {
    setHolidayCalendar({
      asOf: "test",
      entries: [
        {
          year: 2082,
          month: 2,
          day: 10,
          nameEn: "Org Off",
          nameNe: "बिदा",
          kind: "custom",
        },
      ],
    });
    expect(isPublicHoliday("2082-01-01")).toBe(false);
    expect(isPublicHoliday("2082-02-10")).toBe(true);
    expect(getHolidayName("2082-02-10")).toBe("Org Off");
  });

  it("extendHolidayCalendar merges entries", () => {
    resetHolidayCalendar();
    extendHolidayCalendar([
      {
        year: 2082,
        month: 4,
        day: 20,
        nameEn: "Extra",
        nameNe: "अतिरिक्त",
        kind: "custom",
      },
    ]);
    expect(isPublicHoliday("2082-01-01")).toBe(true);
    expect(isPublicHoliday("2082-04-20")).toBe(true);
  });
});
