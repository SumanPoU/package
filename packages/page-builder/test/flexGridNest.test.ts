import { describe, expect, it } from "vitest";
import { flexDefinition } from "../src/blocks/flex";
import { gridDefinition } from "../src/blocks/grid";
import { headingDefinition } from "../src/blocks/heading";
import { textDefinition } from "../src/blocks/text";
import {
  createBlockFromDefinition,
  findBlock,
  insertBlock,
} from "../src/core/blockTree";
import { createRegistry, registerBlock } from "../src/core/registry";

describe("flex/grid nest children", () => {
  it("inserts heading into empty flex", () => {
    const registry = createRegistry();
    registerBlock(registry, flexDefinition);
    registerBlock(registry, headingDefinition);
    const flex = createBlockFromDefinition(flexDefinition);
    let tree = insertBlock([], flex);
    const heading = createBlockFromDefinition(headingDefinition);
    tree = insertBlock(tree, heading, flex.id, 0);
    expect(findBlock(tree, flex.id)?.children?.map((c) => c.id)).toEqual([
      heading.id,
    ]);
  });

  it("inserts text into grid and accepts children", () => {
    const registry = createRegistry();
    registerBlock(registry, gridDefinition);
    registerBlock(registry, textDefinition);
    expect(gridDefinition.isContainer).toBe(true);
    expect(gridDefinition.canAcceptChild?.("text") ?? true).toBe(true);
    const grid = createBlockFromDefinition(gridDefinition);
    expect(grid.children).toEqual([]);
    let tree = insertBlock([], grid);
    const text = createBlockFromDefinition(textDefinition);
    tree = insertBlock(tree, text, grid.id, 0);
    expect(findBlock(tree, grid.id)?.children?.map((c) => c.type)).toEqual([
      "text",
    ]);
  });
});
