import { afterEach, describe, expect, it } from "vitest";

import {
  createBsDateEngine,
  extendCalendarData,
  getCalendarMeta,
  resetHolidayCalendar,
} from "../src";
import { DEFAULT_CALENDAR_DATA } from "../src/calendar-registry";

describe("engine / scalability", () => {
  afterEach(() => {
    resetHolidayCalendar();
  });

  it("exposes calendar meta", () => {
    const meta = getCalendarMeta();
    expect(meta.minYear).toBe(2000);
    expect(meta.maxYear).toBe(2100);
    expect(meta.yearCount).toBe(101);
  });

  it("isolates holiday calendars per engine", () => {
    const a = createBsDateEngine({
      holidays: {
        entries: [
          {
            month: 1,
            day: 1,
            nameEn: "A",
            nameNe: "अ",
          },
        ],
      },
    });
    const b = createBsDateEngine({
      holidays: {
        entries: [
          {
            month: 2,
            day: 1,
            nameEn: "B",
            nameNe: "ब",
          },
        ],
      },
    });
    expect(a.isPublicHoliday("2082-01-01")).toBe(true);
    expect(a.isPublicHoliday("2082-02-01")).toBe(false);
    expect(b.isPublicHoliday("2082-01-01")).toBe(false);
    expect(b.isPublicHoliday("2082-02-01")).toBe(true);
  });

  it("extendCalendarData merges year rows", () => {
    const extended = extendCalendarData(DEFAULT_CALENDAR_DATA, {
      2100: DEFAULT_CALENDAR_DATA.monthDays[2100]!,
    });
    expect(extended.maxYear).toBeGreaterThanOrEqual(2100);
    expect(extended.monthDays[2100]).toBeTruthy();
  });

  it("engine conversion matches module API", () => {
    const engine = createBsDateEngine();
    expect(engine.adToBs("2025-04-14")).toEqual({
      year: 2082,
      month: 1,
      day: 1,
    });
    expect(engine.getMeta().minYear).toBe(2000);
  });
});
