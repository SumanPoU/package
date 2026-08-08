import { describe, expect, it } from "vitest";

import { createCardPreset, createHeroPreset, listPresets } from "../src/presets";

describe("presets", () => {
  it("lists card and hero", () => {
    const ids = listPresets().map((p) => p.id);
    expect(ids).toEqual(["card", "hero"]);
  });

  it("card expands to box with image/heading/text/button", () => {
    const root = createCardPreset();
    expect(root.type).toBe("box");
    expect(root.children?.map((c) => c.type)).toEqual([
      "image",
      "heading",
      "text",
      "button",
    ]);
    const again = createCardPreset();
    expect(again.id).not.toBe(root.id);
  });

  it("hero expands to nested copy + image", () => {
    const root = createHeroPreset();
    expect(root.type).toBe("box");
    expect(root.children?.length).toBe(2);
    expect(root.children?.[0]?.type).toBe("box");
    expect(root.children?.[0]?.children?.map((c) => c.type)).toEqual([
      "heading",
      "text",
      "button",
    ]);
    expect(root.children?.[1]?.type).toBe("image");
  });
});
