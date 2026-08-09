"use client";

import { useId, useState } from "react";
import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";

type AccordionItem = { title: string; content: string };

const readItems = (raw: unknown): AccordionItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      title: String(r.title ?? ""),
      content: String(r.content ?? ""),
    };
  });
};

const DEFAULT_ITEMS: AccordionItem[] = [
  { title: "Section 1", content: "Accordion body for section 1." },
  { title: "Section 2", content: "Accordion body for section 2." },
];

export const AccordionElement = ({ block, props }: BlockRenderProps) => {
  const baseId = useId();
  const items = readItems(props.items);
  const list = items.length > 0 ? items : DEFAULT_ITEMS;
  const allowMultiple = Boolean(props.allowMultiple);
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const handleToggle = (index: number) => {
    setOpen((prev) => {
      const next = new Set(allowMultiple ? prev : []);
      if (prev.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div {...blockRootAttrs(block)} data-pb-type="accordion">
      {list.map((item, i) => {
        const isOpen = open.has(i);
        const panelId = `${baseId}-panel-${i}`;
        const headerId = `${baseId}-header-${i}`;
        return (
          <div key={`${headerId}`} data-open={isOpen ? "true" : "false"}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => handleToggle(i)}
                style={{ width: "100%", textAlign: "left" }}
              >
                {item.title || `Section ${i + 1}`}
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
            >
              {item.content || "Accordion content"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AccordionContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const items = readItems(block.props.items);
  const display = items.length > 0 ? items : [...DEFAULT_ITEMS];
  const allowMultiple = Boolean(block.props.allowMultiple);
  const write = (next: AccordionItem[]) => {
    onChange({ props: { ...block.props, items: next } });
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Allow multiple open</span>
        <input
          type="checkbox"
          checked={allowMultiple}
          aria-label="Allow multiple accordion panels open"
          onChange={(e) =>
            onChange({
              props: { ...block.props, allowMultiple: e.target.checked },
            })
          }
        />
      </label>
      {display.map((item, index) => (
        <div key={index} className="pb-list-item-row">
          <label className="pb-field">
            <span className="pb-field-label">Title</span>
            <input
              type="text"
              value={item.title}
              aria-label={`Accordion title ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, title: e.target.value };
                write(next);
              }}
            />
          </label>
          <label className="pb-field">
            <span className="pb-field-label">Content</span>
            <textarea
              rows={3}
              value={item.content}
              aria-label={`Accordion content ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, content: e.target.value };
                write(next);
              }}
            />
          </label>
          <button
            type="button"
            className="pb-media-upload"
            aria-label={`Remove accordion item ${index + 1}`}
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
            { title: `Section ${display.length + 1}`, content: "" },
          ])
        }
      >
        + Add section
      </button>
    </div>
  );
};

export const accordionDefinition: BlockDefinition = {
  type: "accordion",
  label: "Accordion",
  category: "basic",
  defaultProps: { items: DEFAULT_ITEMS, allowMultiple: false },
  translatableProps: [],
  sharedProps: ["items", "allowMultiple"],
  propsSchema: z
    .object({
      items: z
        .array(z.object({ title: z.string(), content: z.string() }))
        .optional(),
      allowMultiple: z.boolean().optional(),
    })
    .passthrough(),
  render: AccordionElement,
  ContentFields: AccordionContentFields,
  source: "core",
};
