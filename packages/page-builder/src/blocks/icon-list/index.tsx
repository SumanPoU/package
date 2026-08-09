"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";

type IconListItem = { icon: string; text: string };

const readItems = (raw: unknown): IconListItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      icon: String(r.icon ?? "✓"),
      text: String(r.text ?? ""),
    };
  });
};

export const IconListElement = ({ block, props }: BlockRenderProps) => {
  const items = readItems(props.items).filter((i) => i.text.trim());
  const list =
    items.length > 0
      ? items
      : [
          { icon: "✓", text: "First item" },
          { icon: "✓", text: "Second item" },
        ];
  return (
    <ul
      {...blockRootAttrs(block)}
      data-pb-type="icon-list"
      style={{ listStyle: "none", padding: 0, margin: 0 }}
    >
      {list.map((item, i) => (
        <li
          key={`${i}-${item.text.slice(0, 12)}`}
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "flex-start",
            marginBottom: "0.35rem",
          }}
        >
          <span aria-hidden style={{ lineHeight: 1.4 }}>
            {item.icon || "•"}
          </span>
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
};

const IconListContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const raw = block.i18nProps?.[locale]?.items ?? block.props.items;
  const items = readItems(raw);
  const display =
    items.length > 0
      ? items
      : [
          { icon: "✓", text: "First item" },
          { icon: "✓", text: "Second item" },
        ];

  const write = (next: IconListItem[]) => {
    onChange({
      i18nProps: {
        ...(block.i18nProps ?? {}),
        [locale]: { ...(block.i18nProps?.[locale] ?? {}), items: next },
      },
    });
  };

  return (
    <div className="pb-content-fields">
      {display.map((item, index) => (
        <div key={index} className="pb-list-item-row">
          <label className="pb-field">
            <span className="pb-field-label">Icon</span>
            <input
              type="text"
              value={item.icon}
              aria-label={`Icon ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, icon: e.target.value };
                write(next);
              }}
            />
          </label>
          <label className="pb-field">
            <span className="pb-field-label">Text</span>
            <input
              type="text"
              value={item.text}
              aria-label={`Icon list text ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, text: e.target.value };
                write(next);
              }}
            />
          </label>
          <button
            type="button"
            className="pb-media-upload"
            aria-label={`Remove item ${index + 1}`}
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
        onClick={() => write([...display, { icon: "✓", text: "New item" }])}
      >
        + Add item
      </button>
      <p className="pb-hint">
        Style via author CSS on{" "}
        <code>[data-pb-type=&quot;icon-list&quot;]</code>.
      </p>
    </div>
  );
};

export const iconListDefinition: BlockDefinition = {
  type: "icon-list",
  label: "Icon List",
  category: "basic",
  defaultProps: {},
  defaultI18nProps: {
    en: {
      items: [
        { icon: "✓", text: "First item" },
        { icon: "✓", text: "Second item" },
      ],
    },
  },
  translatableProps: ["items"],
  sharedProps: [],
  propsSchema: z
    .object({
      items: z
        .array(z.object({ icon: z.string(), text: z.string() }))
        .optional(),
    })
    .passthrough(),
  render: IconListElement,
  ContentFields: IconListContentFields,
  source: "core",
};
