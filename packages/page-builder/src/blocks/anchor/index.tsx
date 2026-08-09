"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

/** Jump target for in-page links (Elementor Menu Anchor). */
export const AnchorElement = ({ block, props }: BlockRenderProps) => {
  const id = asString(props.anchorId).trim() || block.id;
  return (
    <div
      {...blockRootAttrs(block)}
      id={id}
      data-pb-type="anchor"
      data-anchor-id={id}
      style={{ height: 0, overflow: "hidden" }}
      aria-hidden
    />
  );
};

const AnchorContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const anchorId = asString(block.props.anchorId);
  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Anchor ID</span>
        <input
          type="text"
          value={anchorId}
          placeholder="section-features"
          aria-label="Menu anchor id"
          onChange={(e) =>
            onChange({
              props: {
                ...block.props,
                anchorId: e.target.value.replace(/\s+/g, "-"),
              },
            })
          }
        />
      </label>
      <p className="pb-hint">
        Link buttons to <code>#{anchorId || "…"}</code> to jump here.
      </p>
    </div>
  );
};

export const anchorDefinition: BlockDefinition = {
  type: "anchor",
  label: "Menu Anchor",
  category: "basic",
  defaultProps: { anchorId: "" },
  translatableProps: [],
  sharedProps: ["anchorId"],
  propsSchema: z.object({ anchorId: z.string().optional() }).passthrough(),
  render: AnchorElement,
  ContentFields: AnchorContentFields,
  source: "core",
};
