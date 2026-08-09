import { describe, expect, it } from "vitest";

import {
  createProductionCapabilities,
  isCustomCssAllowed,
  isDataBindingAllowed,
  isSignedBlockImportAllowed,
} from "../src/core/capabilities";

describe("capabilities", () => {
  it("defaults to allow when unset", () => {
    expect(isDataBindingAllowed(undefined)).toBe(true);
    expect(isCustomCssAllowed({})).toBe(true);
    expect(isSignedBlockImportAllowed(undefined)).toBe(false);
  });

  it("respects explicit false", () => {
    expect(isDataBindingAllowed({ allowDataBinding: false })).toBe(false);
    expect(isCustomCssAllowed({ allowCustomCss: false })).toBe(false);
  });

  it("createProductionCapabilities hardens production risk flags", () => {
    const caps = createProductionCapabilities();
    expect(caps.allowCustomJs).toBe(false);
    expect(caps.allowRegisterPluginBlocks).toBe(false);
    expect(caps.allowSignedBlockImport).toBe(false);
    expect(isSignedBlockImportAllowed(caps)).toBe(false);
  });
});
