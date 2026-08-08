import { describe, expect, it } from "vitest";
import { PAGE_SCHEMA_VERSION } from "../src/constants";
import {
  buildStyleDeclarations,
  formatCustomCssRules,
} from "../src/core/blockStyleCss";
import { composePageCss } from "../src/core/customCssComposer";
import type { Page } from "../src/core/types";

describe("blockStyleCss", () => {
  it("wraps declaration-only custom CSS in .b-{id}", () => {
    expect(formatCustomCssRules("color: red;", "abc")).toEqual([
      ".b-abc{color: red;}",
    ]);
  });

  it("rewrites .element to the block selector", () => {
    expect(formatCustomCssRules(".element { margin: 0 }", "x1")).toEqual([
      ".b-x1 { margin: 0 }",
    ]);
  });

  it("builds flex declarations for container", () => {
    const css = buildStyleDeclarations(
      { flexDirection: "column", gap: "12px", align: "center" },
      "container",
    );
    expect(css).toContain("display:flex");
    expect(css).toContain("flex-direction:column");
    expect(css).toContain("gap:12px");
    expect(css).toContain("text-align:center");
  });

  it("emits Elementor-like border/bg/size CSS", () => {
    const css = buildStyleDeclarations(
      {
        backgroundColor: "#f3f4f6",
        borderStyle: "solid",
        borderWidth: "2px",
        borderColor: "#111",
        borderRadius: "8px",
        width: { value: "100", unit: "%" },
        boxShadow: "0 4px 12px rgb(0 0 0 / 12%)",
      },
      "heading",
    );
    expect(css).toContain("background-color:#f3f4f6");
    expect(css).toContain("border-style:solid");
    expect(css).toContain("border-radius:8px");
    expect(css).toContain("width:100%");
    expect(css).toContain("box-shadow:");
  });
});

describe("composePageCss", () => {
  it("emits style + customCss + visibility for a block", () => {
    const page: Page = {
      id: "p1",
      schemaVersion: PAGE_SCHEMA_VERSION,
      meta: {},
      blocks: [
        {
          id: "h1",
          type: "heading",
          props: {},
          style: { margin: { t: "20", unit: "px" } },
          customCss: "color: red;",
          visibility: { hiddenDevices: ["mobile"] },
        },
      ],
    };
    const { css, errors } = composePageCss(page);
    expect(errors).toEqual([]);
    expect(css).toContain(".b-h1{");
    expect(css).toContain("margin-top:20px");
    expect(css).toContain("color: red");
    expect(css).toContain("max-width:639px");
    expect(css).toContain("display:none");
  });

  it("emits canvas device attribute rules for tablet overrides", () => {
    const page: Page = {
      id: "p1",
      schemaVersion: PAGE_SCHEMA_VERSION,
      meta: {},
      blocks: [
        {
          id: "btn",
          type: "button",
          props: {},
          responsiveStyle: {
            tablet: {
              backgroundColor: "#a91e1e",
              borderStyle: "dashed",
              borderWidth: "1px",
            },
          },
        },
      ],
    };
    const { css } = composePageCss(page);
    expect(css).toContain('[data-pb-device="tablet"] .b-btn{');
    expect(css).toContain("background-color:#a91e1e");
    expect(css).toContain("border-style:dashed");
    expect(css).toContain("@media(min-width:640px) and (max-width:1023px)");
  });
});
