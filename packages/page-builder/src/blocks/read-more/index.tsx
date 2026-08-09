"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

/** Jump link for blog / long-form “read more” contexts. */
export const ReadMoreElement = ({ block, props }: BlockRenderProps) => {
  const href = asString(props.href, "#").trim() || "#";
  const label = asString(props.label, "Read more").trim() || "Read more";
  return (
    <a {...blockRootAttrs(block)} data-pb-type="read-more" href={href}>
      {label}
    </a>
  );
};

const ReadMoreContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const href = asString(block.props.href, "#");
  const label = asString(block.props.label, "Read more");
  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Label</span>
        <input
          type="text"
          value={label}
          aria-label="Read more label"
          onChange={(e) =>
            onChange({ props: { ...block.props, label: e.target.value } })
          }
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Href</span>
        <input
          type="text"
          value={href}
          aria-label="Read more href"
          onChange={(e) =>
            onChange({ props: { ...block.props, href: e.target.value } })
          }
        />
      </label>
    </div>
  );
};

export const readMoreDefinition: BlockDefinition = {
  type: "read-more",
  label: "Read More",
  category: "basic",
  defaultProps: { label: "Read more", href: "#" },
  translatableProps: [],
  sharedProps: ["label", "href"],
  propsSchema: z
    .object({
      label: z.string().optional(),
      href: z.string().optional(),
    })
    .passthrough(),
  render: ReadMoreElement,
  ContentFields: ReadMoreContentFields,
  source: "core",
};
