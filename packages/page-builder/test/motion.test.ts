import { describe, expect, it } from "vitest";
import { PAGE_SCHEMA_VERSION } from "../src/constants";
import { blockRootAttrs } from "../src/core/blockClassName";
import { composePageCss } from "../src/core/customCssComposer";
import { composePageJs } from "../src/core/customJsComposer";
import {
  getBlockMotion,
  normalizeMotion,
  pageNeedsMotionRuntime,
  pageUsesMotion,
} from "../src/core/motion";
import type { Block, Page } from "../src/core/types";

const pageOf = (blocks: Block[]): Page => ({
  id: "p1",
  schemaVersion: PAGE_SCHEMA_VERSION,
  revision: "1",
  meta: { title: "t" },
  blocks,
});

describe("motion", () => {
  it("normalizeMotion drops none / defaults", () => {
    expect(
      normalizeMotion({ entrance: "none", hover: "none" }),
    ).toBeUndefined();
    expect(normalizeMotion({ entrance: "fadeInUp", durationMs: 600 })).toEqual({
      entrance: "fadeInUp",
    });
    expect(
      normalizeMotion({
        entrance: "zoomIn",
        durationMs: 800,
        delayMs: 100,
        trigger: "load",
        hover: "grow",
      }),
    ).toEqual({
      entrance: "zoomIn",
      durationMs: 800,
      delayMs: 100,
      trigger: "load",
      hover: "grow",
    });
  });

  it("composePageCss includes keyframes only when motion is used", () => {
    const idle = composePageCss(
      pageOf([{ id: "a", type: "heading", props: {} }]),
    );
    expect(idle.css).not.toContain("@keyframes pb-fadeIn");

    const active = composePageCss(
      pageOf([
        {
          id: "b",
          type: "heading",
          props: {},
          motion: { entrance: "fadeInUp", durationMs: 500 },
        },
      ]),
    );
    expect(active.css).toContain("@keyframes pb-fadeInUp");
    expect(active.css).toContain("--pb-motion-duration:500ms");
  });

  it("composePageJs appends runtime for entrance motion", () => {
    const idle = composePageJs(pageOf([{ id: "a", type: "text", props: {} }]));
    expect(idle.scripts.length).toBe(0);

    const active = composePageJs(
      pageOf([
        {
          id: "b",
          type: "text",
          props: {},
          motion: { entrance: "fadeIn" },
        },
      ]),
    );
    expect(active.scripts.length).toBe(1);
    expect(active.scripts[0]!.code).toContain("__pbMotionScan");
  });

  it("blockRootAttrs emits data-pb-motion attrs", () => {
    const attrs = blockRootAttrs({
      id: "x",
      type: "button",
      props: {},
      motion: { entrance: "slideInLeft", trigger: "load", hover: "float" },
    });
    expect(attrs["data-pb-motion"]).toBe("slideInLeft");
    expect(attrs["data-pb-motion-trigger"]).toBe("load");
    expect(attrs["data-pb-hover"]).toBe("float");
  });

  it("pageUsesMotion / pageNeedsMotionRuntime", () => {
    const blocks: Block[] = [
      {
        id: "c",
        type: "box",
        props: {},
        children: [
          { id: "d", type: "image", props: {}, motion: { hover: "grow" } },
        ],
      },
    ];
    expect(pageUsesMotion(blocks)).toBe(true);
    expect(pageNeedsMotionRuntime(blocks)).toBe(false);
    expect(getBlockMotion(blocks[0]!).entrance).toBeUndefined();
  });
});
