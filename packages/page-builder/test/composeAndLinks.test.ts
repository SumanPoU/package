import { describe, expect, it } from "vitest";

import { linkTargetRel } from "../src/blocks/shared";
import { PAGE_SCHEMA_VERSION } from "../src/constants";
import { composePageCss } from "../src/core/customCssComposer";

describe("composePageCss global", () => {
  it("still applies global CSS when remote url() is not allow-listed", () => {
    const result = composePageCss({
      id: "p1",
      schemaVersion: PAGE_SCHEMA_VERSION,
      revision: "1",
      meta: { title: "t" },
      blocks: [],
      globalCss: `[data-pb-page] { color: tomato; }\n.hero { background: url(https://cdn.example/x.png); }`,
    });
    expect(result.css).toContain("color: tomato");
    expect(result.css).toContain("[data-pb-page]");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("strips @import but keeps following rules", () => {
    const result = composePageCss({
      id: "p1",
      schemaVersion: PAGE_SCHEMA_VERSION,
      revision: "1",
      meta: { title: "t" },
      blocks: [],
      globalCss: `@import url("x.css");\n[data-pb-page] { font-size: 18px; }`,
    });
    expect(result.css).toContain("font-size: 18px");
    expect(result.css.toLowerCase()).not.toContain("@import");
  });
});

describe("linkTargetRel", () => {
  it("adds blank + noopener and nofollow", () => {
    expect(linkTargetRel({ openInNewWindow: true, nofollow: true })).toEqual({
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    });
  });

  it("omits attrs when unset", () => {
    expect(linkTargetRel({})).toEqual({});
  });
});
