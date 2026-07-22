import { describe, expect, it } from "vitest";

import {
  NrbApiError,
  NrbForexError,
  NrbRateNotFoundError,
  NrbValidationError,
} from "../src";

describe("errors", () => {
  it("typed hierarchy", () => {
    const v = new NrbValidationError("bad");
    expect(v).toBeInstanceOf(NrbForexError);
    expect(v.code).toBe("NRB_VALIDATION");

    const a = new NrbApiError("upstream", 500, { x: 1 });
    expect(a.statusCode).toBe(500);
    expect(a.body).toEqual({ x: 1 });

    const n = new NrbRateNotFoundError("2026-07-19", "USD");
    expect(n.date).toBe("2026-07-19");
    expect(n.currency).toBe("USD");
    expect(n.message).toContain("USD");
  });
});
