import { describe, expect, it } from "vitest";
import { adjustStep, cycleStep, resetPreferences } from "../src/preferences";
import {
  DEFAULT_A11Y_SHORTCUTS,
  formatShortcutLabel,
  mergeA11yShortcuts,
  resolveA11yShortcuts,
} from "../src/shortcuts";
import { DEFAULT_HOTKEY } from "../src/types";

describe("shortcuts registry", () => {
  it("includes panel toggle by default", () => {
    const panel = DEFAULT_A11Y_SHORTCUTS.find((s) => s.id === "togglePanel");
    expect(panel?.keys).toEqual(DEFAULT_HOTKEY);
    expect(panel?.action).toEqual({ type: "togglePanel" });
  });

  it("formats labels", () => {
    expect(
      formatShortcutLabel({ altKey: true, shiftKey: true, key: "r" }),
    ).toBe("Alt+Shift+R");
    expect(formatShortcutLabel({ altKey: true, key: "=" })).toBe("Alt++");
  });

  it("merge removes and overrides by id", () => {
    const next = mergeA11yShortcuts(DEFAULT_A11Y_SHORTCUTS, [
      { id: "reset", keys: null },
      {
        id: "textSizeInc",
        keys: { altKey: true, key: "]" },
        action: { type: "feature", feature: "textSize", mode: "inc" },
        label: "Inc",
      },
    ]);
    expect(next.find((s) => s.id === "reset")).toBeUndefined();
    expect(next.find((s) => s.id === "textSizeInc")?.keys.key).toBe("]");
  });

  it("resolve: false keeps only hotkey panel toggle", () => {
    const list = resolveA11yShortcuts({
      shortcuts: false,
      hotkey: { altKey: true, key: "a" },
    });
    expect(list).toHaveLength(1);
    expect(list[0]?.action).toEqual({ type: "togglePanel" });
  });

  it("resolve: hotkey null drops panel from defaults", () => {
    const list = resolveA11yShortcuts({ hotkey: null });
    expect(list.find((s) => s.id === "togglePanel")).toBeUndefined();
    expect(list.length).toBeGreaterThan(0);
  });
});

describe("adjustStep", () => {
  it("clamps at bounds", () => {
    const base = resetPreferences();
    expect(adjustStep(base, "textSize", -1)).toBe(base);
    const up = adjustStep(base, "textSize", 1);
    expect(up.textSize).toBe(1);
    const cycled = cycleStep(base, "textSize");
    expect(cycled.textSize).toBe(1);
  });
});
