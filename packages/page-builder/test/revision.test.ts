import { describe, expect, it } from "vitest";

import { assertRevisionMatch } from "../src/core/revision";

describe("assertRevisionMatch", () => {
  it("allows matching revisions", () => {
    expect(assertRevisionMatch({ revision: "3" }, "3")).toEqual({ ok: true });
  });

  it("allows both undefined", () => {
    expect(assertRevisionMatch({}, undefined)).toEqual({ ok: true });
  });

  it("reports conflict when revisions differ", () => {
    expect(assertRevisionMatch({ revision: "5" }, "4")).toEqual({
      ok: false,
      conflict: true,
      expectedRevision: "4",
      currentRevision: "5",
    });
  });
});
