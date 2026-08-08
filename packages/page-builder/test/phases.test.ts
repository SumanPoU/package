import { describe, expect, it } from "vitest";

import {
  CANVAS_SANDBOX,
  clearClipboard,
  copyBlockToClipboard,
  createRegistry,
  parseAuthorCss,
  parseBridgeMessage,
  registerPrimitives,
  sanitizeRichText,
  takePasteClone,
} from "../src/index";

describe("primitives registry", () => {
  it("registers core primitives without drift", () => {
    const registry = createRegistry();
    registerPrimitives(registry);
    for (const type of [
      "box",
      "container",
      "flex",
      "grid",
      "heading",
      "text",
      "image",
      "button",
      "divider",
      "spacer",
      "repeater",
    ]) {
      const def = registry.get(type);
      expect(def, type).toBeDefined();
      expect(def?.render).toBeTypeOf("function");
      expect(def?.ContentFields).toBeTypeOf("function");
      expect(def?.propsSchema).toBeDefined();
      expect(Array.isArray(def?.translatableProps)).toBe(true);
      expect(Array.isArray(def?.sharedProps)).toBe(true);
    }
  });
});

describe("cssParser", () => {
  it("rejects @import", () => {
    const result = parseAuthorCss('@import url("x.css"); .a { color: red; }');
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.message.includes("@import"))).toBe(true);
  });
});

describe("sanitizeRichText", () => {
  it("strips script and preserves Unicode Nepali", () => {
    const out = sanitizeRichText(
      '<p>नमस्ते</p><script>alert(1)</script><a href="javascript:alert(1)">x</a>',
    );
    expect(out).toContain("नमस्ते");
    expect(out.toLowerCase()).not.toContain("<script");
    expect(out.toLowerCase()).not.toContain("javascript:");
  });
});

describe("clipboard", () => {
  it("paste regenerates ids", () => {
    clearClipboard();
    copyBlockToClipboard({
      id: "orig",
      type: "heading",
      props: {},
      children: [{ id: "kid", type: "text", props: {} }],
    });
    const pasted = takePasteClone();
    expect(pasted?.id).not.toBe("orig");
    expect(pasted?.children?.[0]?.id).not.toBe("kid");
  });
});

describe("sandbox + bridge", () => {
  it("sandbox excludes allow-same-origin", () => {
    expect(CANVAS_SANDBOX).toBe("allow-scripts allow-forms");
    expect(CANVAS_SANDBOX.includes("allow-same-origin")).toBe(false);
  });

  it("rejects unknown bridge types and bad envelopes", () => {
    expect(parseBridgeMessage({ hello: 1 }).ok).toBe(false);
    expect(
      parseBridgeMessage({ type: "save", version: 1, payload: {} }).ok,
    ).toBe(false);
    expect(
      parseBridgeMessage({
        type: "select",
        version: 1,
        payload: { blockId: "a" },
      }).ok,
    ).toBe(true);
  });
});
