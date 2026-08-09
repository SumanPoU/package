"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

export const QuoteElement = ({ block, props }: BlockRenderProps) => {
  const body = asString(props.body).trim();
  const cite = asString(props.cite).trim();
  return (
    <blockquote
      {...blockRootAttrs(block)}
      data-pb-type="quote"
      cite={cite || undefined}
    >
      {body || "Quote"}
      {cite ? <cite>{cite}</cite> : null}
    </blockquote>
  );
};

const QuoteContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const body =
    typeof block.i18nProps?.[locale]?.body === "string"
      ? (block.i18nProps[locale]!.body as string)
      : asString(block.props.body);
  const cite =
    typeof block.i18nProps?.[locale]?.cite === "string"
      ? (block.i18nProps[locale]!.cite as string)
      : asString(block.props.cite);

  const handleI18n = (key: string, value: string) => {
    onChange({
      i18nProps: {
        ...(block.i18nProps ?? {}),
        [locale]: { ...(block.i18nProps?.[locale] ?? {}), [key]: value },
      },
    });
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Quote</span>
        <textarea
          rows={3}
          value={body}
          aria-label="Quote text"
          onChange={(e) => handleI18n("body", e.target.value)}
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Citation</span>
        <input
          type="text"
          value={cite}
          aria-label="Quote citation"
          onChange={(e) => handleI18n("cite", e.target.value)}
        />
      </label>
    </div>
  );
};

export const quoteDefinition: BlockDefinition = {
  type: "quote",
  label: "Quote",
  category: "basic",
  defaultProps: {},
  defaultI18nProps: {
    en: { body: "Quote", cite: "" },
    ne: { body: "उद्धरण", cite: "" },
  },
  translatableProps: ["body", "cite"],
  sharedProps: [],
  propsSchema: z
    .object({
      body: z.string().optional(),
      cite: z.string().optional(),
    })
    .passthrough(),
  render: QuoteElement,
  ContentFields: QuoteContentFields,
  source: "core",
};
