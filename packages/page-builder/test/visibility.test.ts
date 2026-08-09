import { describe, expect, it } from "vitest";

import type { Block } from "../src/core/types";
import {
  type RenderContext,
  resolveVisibility,
} from "../src/core/visibilityResolve";

const baseCtx = (over: Partial<RenderContext> = {}): RenderContext => ({
  locale: "en",
  device: "desktop",
  ...over,
});

const block = (over: Partial<Block> = {}): Block => ({
  id: "b1",
  type: "heading",
  props: {},
  ...over,
});

describe("resolveVisibility", () => {
  it("shows by default", () => {
    expect(resolveVisibility(block(), baseCtx(), "canvas")).toBe("show");
    expect(resolveVisibility(block(), baseCtx(), "preview")).toBe("show");
  });

  it("ghosts on canvas for hiddenDevices / hiddenLocales / visibleWhen", () => {
    expect(
      resolveVisibility(
        block({ visibility: { hiddenDevices: ["desktop"] } }),
        baseCtx(),
        "canvas",
      ),
    ).toBe("ghost");
    expect(
      resolveVisibility(
        block({ visibility: { hiddenLocales: ["ne"] } }),
        baseCtx({ locale: "ne" }),
        "canvas",
      ),
    ).toBe("ghost");
    expect(
      resolveVisibility(
        block({
          visibleWhen: { allOf: [{ key: "auth.isLoggedIn", equals: true }] },
        }),
        baseCtx({ auth: { isLoggedIn: false } }),
        "canvas",
      ),
    ).toBe("ghost");
  });

  it("hides on preview/open for the same conditions", () => {
    expect(
      resolveVisibility(
        block({ visibility: { hiddenDevices: ["mobile"] } }),
        baseCtx({ device: "mobile" }),
        "open",
      ),
    ).toBe("hide");
    expect(
      resolveVisibility(
        block({ visibility: { hiddenOnPublish: true } }),
        baseCtx(),
        "preview",
      ),
    ).toBe("hide");
  });

  it("hiddenOnCanvas ghosts only on canvas", () => {
    const b = block({ visibility: { hiddenOnCanvas: true } });
    expect(resolveVisibility(b, baseCtx(), "canvas")).toBe("ghost");
    expect(resolveVisibility(b, baseCtx(), "open")).toBe("show");
  });
});
