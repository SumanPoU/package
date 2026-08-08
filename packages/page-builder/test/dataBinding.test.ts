import { describe, expect, it } from "vitest";

import {
  applyBindingsToBlock,
  expandRepeater,
  resolveBindingString,
} from "../src/core/dataBinding";
import type { Block } from "../src/core/types";

describe("dataBinding tokens (§25.4)", () => {
  it("resolves item paths and clears missing", () => {
    const item = { title: "Hello", nested: { x: 1 } };
    expect(resolveBindingString("{{item.title}}", item)).toBe("Hello");
    expect(resolveBindingString("Hi {{item.title}}!", item)).toBe("Hi Hello!");
    expect(resolveBindingString("{{item.missing}}", item)).toBe("");
    expect(resolveBindingString("{{item.nested.x}}", item)).toBe("1");
  });

  it("leaves invalid tokens literal", () => {
    const item = { title: "T" };
    expect(resolveBindingString("{{item.}}", item)).toBe("{{item.}}");
    expect(resolveBindingString("{{item.0bad}}", item)).toBe("{{item.0bad}}");
    expect(resolveBindingString("{{nope.title}}", item)).toBe("{{nope.title}}");
    expect(resolveBindingString("keep {{ raw", item)).toBe("keep {{ raw");
  });

  it("does not re-scan resolved CMS values", () => {
    const item = { title: "{{item.evil}}" };
    expect(resolveBindingString("{{item.title}}", item)).toBe("{{item.evil}}");
  });
});

describe("expandRepeater", () => {
  const templateHeading = (): Block => ({
    id: "tpl-h",
    type: "heading",
    props: {},
    i18nProps: { en: { title: "{{item.title}}" } },
  });

  it("expands children template when itemTemplate empty", () => {
    const repeater: Block = {
      id: "r1",
      type: "repeater",
      props: {},
      dataBinding: {
        sourceId: "posts",
        params: { limit: 2 },
        itemTemplate: [],
      },
      children: [templateHeading()],
    };
    const { state, instances } = expandRepeater(repeater, {
      locale: "en",
      device: "desktop",
      dataSources: {
        posts: {
          items: [{ title: "A" }, { title: "B" }],
        },
      },
    });
    expect(state).toBe("ready");
    expect(instances).toHaveLength(2);
    expect(instances[0]?.[0]?.i18nProps?.en?.title).toBe("A");
    expect(instances[1]?.[0]?.i18nProps?.en?.title).toBe("B");
    expect(instances[0]?.[0]?.id).not.toBe("tpl-h");
  });

  it("applyBindingsToBlock clones nested trees", () => {
    const box: Block = {
      id: "box",
      type: "box",
      props: {},
      children: [
        {
          id: "t",
          type: "text",
          props: {},
          i18nProps: { en: { html: "<p>{{item.body}}</p>" } },
        },
      ],
    };
    const out = applyBindingsToBlock(box, { body: "Hi" });
    expect(out.id).not.toBe("box");
    expect(out.children?.[0]?.i18nProps?.en?.html).toBe("<p>Hi</p>");
  });
});
