"use client";

import { useId, useState } from "react";
import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

export const ToggleElement = ({ block, props }: BlockRenderProps) => {
  const baseId = useId();
  const title = asString(props.title, "Toggle").trim() || "Toggle";
  const content = asString(props.content).trim() || "Toggle content";
  const startOpen = Boolean(props.defaultOpen);
  const [open, setOpen] = useState(startOpen);
  const panelId = `${baseId}-panel`;
  const headerId = `${baseId}-header`;

  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="toggle"
      data-open={open ? "true" : "false"}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", textAlign: "left" }}
      >
        {title}
      </button>
      <div id={panelId} role="region" aria-labelledby={headerId} hidden={!open}>
        {content}
      </div>
    </div>
  );
};

const ToggleContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const title = asString(block.props.title, "Toggle");
  const content = asString(block.props.content);
  const defaultOpen = Boolean(block.props.defaultOpen);

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Title</span>
        <input
          type="text"
          value={title}
          aria-label="Toggle title"
          onChange={(e) =>
            onChange({ props: { ...block.props, title: e.target.value } })
          }
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Content</span>
        <textarea
          rows={4}
          value={content}
          aria-label="Toggle content"
          onChange={(e) =>
            onChange({ props: { ...block.props, content: e.target.value } })
          }
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Open by default</span>
        <input
          type="checkbox"
          checked={defaultOpen}
          aria-label="Toggle open by default"
          onChange={(e) =>
            onChange({
              props: { ...block.props, defaultOpen: e.target.checked },
            })
          }
        />
      </label>
    </div>
  );
};

export const toggleDefinition: BlockDefinition = {
  type: "toggle",
  label: "Toggle",
  category: "basic",
  defaultProps: {
    title: "Toggle",
    content: "Expandable section content.",
    defaultOpen: false,
  },
  translatableProps: [],
  sharedProps: ["title", "content", "defaultOpen"],
  propsSchema: z
    .object({
      title: z.string().optional(),
      content: z.string().optional(),
      defaultOpen: z.boolean().optional(),
    })
    .passthrough(),
  render: ToggleElement,
  ContentFields: ToggleContentFields,
  source: "core",
};
