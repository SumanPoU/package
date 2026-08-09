"use client";

import { useId, useState } from "react";
import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";

type TabItem = { title: string; content: string };

const readTabs = (raw: unknown): TabItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      title: String(r.title ?? ""),
      content: String(r.content ?? ""),
    };
  });
};

const DEFAULT_TABS: TabItem[] = [
  { title: "Tab 1", content: "Content for the first tab." },
  { title: "Tab 2", content: "Content for the second tab." },
];

export const TabsElement = ({ block, props }: BlockRenderProps) => {
  const baseId = useId();
  const tabs = readTabs(props.tabs);
  const list = tabs.length > 0 ? tabs : DEFAULT_TABS;
  const [active, setActive] = useState(0);
  const safe = Math.min(active, list.length - 1);
  const panel = list[safe]!;

  return (
    <div {...blockRootAttrs(block)} data-pb-type="tabs">
      <div
        role="tablist"
        aria-label="Tabs"
        style={{ display: "flex", gap: "0.25rem" }}
      >
        {list.map((tab, i) => {
          const selected = i === safe;
          return (
            <button
              key={`${baseId}-tab-${i}`}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
            >
              {tab.title || `Tab ${i + 1}`}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${safe}`}
        aria-labelledby={`${baseId}-tab-${safe}`}
        style={{ marginTop: "0.75rem" }}
      >
        {panel.content || "Tab content"}
      </div>
    </div>
  );
};

const TabsContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const tabs = readTabs(block.props.tabs);
  const display = tabs.length > 0 ? tabs : [...DEFAULT_TABS];
  const write = (next: TabItem[]) => {
    onChange({ props: { ...block.props, tabs: next } });
  };

  return (
    <div className="pb-content-fields">
      {display.map((tab, index) => (
        <div key={index} className="pb-list-item-row">
          <label className="pb-field">
            <span className="pb-field-label">Title</span>
            <input
              type="text"
              value={tab.title}
              aria-label={`Tab title ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...tab, title: e.target.value };
                write(next);
              }}
            />
          </label>
          <label className="pb-field">
            <span className="pb-field-label">Content</span>
            <textarea
              rows={3}
              value={tab.content}
              aria-label={`Tab content ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...tab, content: e.target.value };
                write(next);
              }}
            />
          </label>
          <button
            type="button"
            className="pb-media-upload"
            aria-label={`Remove tab ${index + 1}`}
            onClick={() => write(display.filter((_, i) => i !== index))}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="pb-media-upload"
        style={{ width: "100%" }}
        onClick={() =>
          write([
            ...display,
            { title: `Tab ${display.length + 1}`, content: "" },
          ])
        }
      >
        + Add tab
      </button>
    </div>
  );
};

export const tabsDefinition: BlockDefinition = {
  type: "tabs",
  label: "Tabs",
  category: "basic",
  defaultProps: { tabs: DEFAULT_TABS },
  translatableProps: [],
  sharedProps: ["tabs"],
  propsSchema: z
    .object({
      tabs: z
        .array(z.object({ title: z.string(), content: z.string() }))
        .optional(),
    })
    .passthrough(),
  render: TabsElement,
  ContentFields: TabsContentFields,
  source: "core",
};
