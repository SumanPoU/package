import { describe, expect, it } from "vitest";

import {
  type Block,
  cloneBlock,
  createBlockId,
  findBlock,
  findBlockPath,
  insertBlock,
  moveBlock,
  moveBlockByDelta,
  removeBlock,
  updateBlock,
} from "../src/index";

const block = (id: string, type: string, children?: Block[]): Block => ({
  id,
  type,
  props: {},
  children,
});

describe("blockTree", () => {
  it("finds nested blocks and paths", () => {
    const tree = [
      block("root", "box", [block("child", "heading"), block("sib", "text")]),
    ];
    expect(findBlock(tree, "child")?.type).toBe("heading");
    const path = findBlockPath(tree, "sib");
    expect(path?.parent?.id).toBe("root");
    expect(path?.index).toBe(1);
  });

  it("inserts at root and under parent", () => {
    let tree: Block[] = [];
    const a = block("a", "heading");
    tree = insertBlock(tree, a);
    expect(tree.map((b) => b.id)).toEqual(["a"]);

    const box = block("box", "box");
    tree = insertBlock(tree, box, null, 0);
    expect(tree.map((b) => b.id)).toEqual(["box", "a"]);

    const child = block("c", "text");
    tree = insertBlock(tree, child, "box");
    expect(findBlock(tree, "box")?.children?.map((b) => b.id)).toEqual(["c"]);
  });

  it("removes and updates immutably", () => {
    const tree = [
      block("root", "box", [block("child", "heading"), block("keep", "text")]),
    ];
    const removed = removeBlock(tree, "child");
    expect(findBlock(removed, "child")).toBeUndefined();
    expect(findBlock(tree, "child")).toBeDefined();

    const updated = updateBlock(removed, "keep", (b) => ({
      ...b,
      props: { ...b.props, x: 1 },
    }));
    expect(findBlock(updated, "keep")?.props.x).toBe(1);
  });

  it("moves without creating cycles", () => {
    let tree: Block[] = [
      block("a", "box", [block("b", "box", [block("c", "text")])]),
      block("d", "heading"),
    ];
    tree = moveBlock(tree, "d", "b", 0);
    expect(findBlock(tree, "b")?.children?.map((b) => b.id)).toEqual([
      "d",
      "c",
    ]);

    expect(() => moveBlock(tree, "a", "c")).toThrow(/descendant/);
    expect(() => moveBlock(tree, "a", "a")).toThrow(/itself/);
  });

  it("moveBlockByDelta reorders siblings", () => {
    let tree: Block[] = [
      block("a", "heading"),
      block("b", "text"),
      block("c", "button"),
    ];
    tree = moveBlockByDelta(tree, "b", -1);
    expect(tree.map((b) => b.id)).toEqual(["b", "a", "c"]);
    tree = moveBlockByDelta(tree, "b", -1);
    expect(tree.map((b) => b.id)).toEqual(["b", "a", "c"]);
    tree = moveBlockByDelta(tree, "a", 1);
    expect(tree.map((b) => b.id)).toEqual(["b", "c", "a"]);
  });

  it("cloneBlock regenerates ids deeply and preserves i18nProps", () => {
    const original: Block = {
      id: "old",
      type: "box",
      props: { shared: true },
      i18nProps: { en: { title: "Hi" }, ne: { title: "नमस्ते" } },
      children: [{ id: "kid", type: "text", props: {} }],
    };
    const cloned = cloneBlock(original);
    expect(cloned.id).not.toBe("old");
    expect(cloned.children?.[0]?.id).not.toBe("kid");
    expect(cloned.i18nProps).toEqual(original.i18nProps);
    expect(cloned.i18nProps).not.toBe(original.i18nProps);
    expect(createBlockId()).toMatch(/./);
  });
});
