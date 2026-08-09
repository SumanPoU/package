import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { Block, BlockDefinition } from "../src/index";
import {
  CORE_PRIMITIVE_TYPES,
  createDefaultLocaleConfig,
  createRegistry,
  registerPrimitives,
  resolveProps,
} from "../src/index";

const locales = createDefaultLocaleConfig();

const sampleBlock = (def: BlockDefinition): Block => ({
  id: `t_${def.type}`,
  type: def.type,
  props: { ...def.defaultProps },
  i18nProps: def.defaultI18nProps
    ? structuredClone(def.defaultI18nProps)
    : undefined,
});

describe("primitive a11y smoke (§14 / ADR-13)", () => {
  const registry = createRegistry();
  registerPrimitives(registry);

  for (const type of CORE_PRIMITIVE_TYPES) {
    it(`${type} render uses semantic markup`, () => {
      const def = registry.get(type)!;
      const block = sampleBlock(def);
      const props = resolveProps(block, locales.defaultLocale, locales);
      const html = renderToStaticMarkup(
        createElement(def.render, {
          block,
          props,
        }),
      );

      expect(html.length).toBeGreaterThan(0);
      // No click-only div buttons in core primitives.
      expect(html).not.toMatch(/<div[^>]+onclick=/i);

      if (type === "heading") expect(html).toMatch(/<h[1-6]\b/i);
      if (type === "button") expect(html).toMatch(/<(a|button)\b/i);
      if (type === "image") {
        expect(html).toMatch(/<img\b/i);
        expect(html).toMatch(/\balt=/i);
      }
      if (type === "quote") expect(html).toMatch(/<blockquote\b/i);
      if (type === "alert") {
        expect(html).toMatch(/\brole="(alert|status)"/i);
      }
      if (type === "list") expect(html).toMatch(/<(ul|ol)\b/i);
    });
  }
});
