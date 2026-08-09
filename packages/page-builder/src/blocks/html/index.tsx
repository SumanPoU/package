"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import { sanitizeRichText } from "../../core/sanitizeRichText";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

export const HtmlElement = ({ block, props }: BlockRenderProps) => {
  const html = sanitizeRichText(asString(props.html));
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="html"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized allow-list
      dangerouslySetInnerHTML={{ __html: html || "<p></p>" }}
    />
  );
};

const HtmlContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const html =
    typeof block.i18nProps?.[locale]?.html === "string"
      ? (block.i18nProps[locale]!.html as string)
      : typeof block.props.html === "string"
        ? block.props.html
        : "";

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">HTML</span>
        <textarea
          rows={8}
          value={html}
          aria-label="HTML content"
          placeholder="<p>Hello</p>"
          onChange={(e) => {
            const i18nProps = { ...(block.i18nProps ?? {}) };
            i18nProps[locale] = {
              ...(i18nProps[locale] ?? {}),
              html: e.target.value,
            };
            onChange({ i18nProps });
          }}
        />
        <p className="pb-hint">
          Allow-listed tags only (p, strong, em, ul, ol, li, a, …). Scripts are
          stripped.
        </p>
      </label>
    </div>
  );
};

export const htmlDefinition: BlockDefinition = {
  type: "html",
  label: "HTML",
  category: "embeds",
  defaultProps: {},
  defaultI18nProps: {
    en: { html: "<p>Custom HTML</p>" },
    ne: { html: "<p>कस्टम HTML</p>" },
  },
  translatableProps: ["html"],
  sharedProps: [],
  propsSchema: z
    .object({
      html: z.string().optional(),
    })
    .passthrough(),
  render: HtmlElement,
  ContentFields: HtmlContentFields,
  source: "core",
};
