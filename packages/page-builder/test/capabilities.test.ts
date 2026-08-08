import { describe, expect, it } from "vitest";

import {
  isCustomCssAllowed,
  isDataBindingAllowed,
} from "../src/core/capabilities";

describe("capabilities", () => {
  it("defaults to allow when unset", () => {
    expect(isDataBindingAllowed(undefined)).toBe(true);
    expect(isCustomCssAllowed({})).toBe(true);
  });

  it("respects explicit false", () => {
    expect(isDataBindingAllowed({ allowDataBinding: false })).toBe(false);
    expect(isCustomCssAllowed({ allowCustomCss: false })).toBe(false);
  });
});
