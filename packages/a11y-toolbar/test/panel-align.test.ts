import { describe, expect, it } from "vitest";
import { resolvePanelAlign, resolvePanelStyle } from "../src/A11yToolbar";

describe("resolvePanelAlign", () => {
  it("follows the launcher when panelAlign is auto", () => {
    expect(resolvePanelAlign("bottom-right", "auto")).toBe("right");
    expect(resolvePanelAlign("bottom-left", "auto")).toBe("left");
    expect(resolvePanelAlign("bottom-center", "auto")).toBe("center");
    expect(resolvePanelAlign("top-center", "auto")).toBe("center");
    expect(resolvePanelAlign("middle-left", "auto")).toBe("beside-left");
    expect(resolvePanelAlign("middle-right", "auto")).toBe("beside-right");
  });

  it("overrides horizontal edge when panelAlign is explicit", () => {
    expect(resolvePanelAlign("bottom-center", "left")).toBe("left");
    expect(resolvePanelAlign("bottom-center", "right")).toBe("right");
    expect(resolvePanelAlign("bottom-left", "center")).toBe("center");
    expect(resolvePanelAlign("middle-left", "left")).toBe("left");
    expect(resolvePanelAlign("middle-left", "right")).toBe("right");
  });
});

describe("resolvePanelStyle", () => {
  it("pins bottom-center + left to the left edge and fills the viewport (no gap above launcher)", () => {
    const style = resolvePanelStyle("bottom-center", "left");
    expect(style.left).toContain("--itzsa-a11y-offset");
    expect(style.right).toBe("auto");
    expect(style.bottom).toContain("--itzsa-a11y-offset");
    expect(style.top).toContain("--itzsa-a11y-offset");
    expect(style.bottom).not.toContain("--itzsa-a11y-launcher-size");
    expect(style.height).toBeUndefined();
  });

  it("pins bottom-center + right to the right edge", () => {
    const style = resolvePanelStyle("bottom-center", "right");
    expect(style.right).toContain("--itzsa-a11y-offset");
    expect(style.left).toBe("auto");
  });

  it("centers the panel when align is center", () => {
    const style = resolvePanelStyle("bottom-center", "center");
    expect(style.left).toBe(0);
    expect(style.right).toBe(0);
    expect(style.marginInline).toBe("auto");
  });
});
