"use client";

import { useId } from "react";
import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

export type ListStyle =
  | "disc"
  | "decimal"
  | "lower-alpha"
  | "upper-alpha"
  | "lower-roman"
  | "upper-roman";

const LIST_STYLES: { value: ListStyle; label: string }[] = [
  { value: "disc", label: "Bullet (unordered)" },
  { value: "decimal", label: "Numbered (1, 2, 3...)" },
  { value: "lower-alpha", label: "Lowercase letters (a, b, c...)" },
  { value: "upper-alpha", label: "Uppercase letters (A, B, C...)" },
  { value: "lower-roman", label: "Lowercase roman (i, ii, iii...)" },
  { value: "upper-roman", label: "Uppercase roman (I, II, III...)" },
];

const readItems = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x ?? ""));
  }
  if (typeof raw === "string") {
    return raw.split("\n").map((l) => l);
  }
  return [];
};

const itemsToStorage = (items: string[]): string => items.join("\n");

export const ListElement = ({ block, props }: BlockRenderProps) => {
  const style = (asString(props.listStyle, "disc") || "disc") as ListStyle;
  const ordered = style !== "disc";
  const items = readItems(props.items)
    .map((l) => l.trim())
    .filter(Boolean);
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      {...blockRootAttrs(block)}
      data-pb-type="list"
      style={{ listStyleType: style, paddingLeft: "1.25rem" }}
    >
      {items.length === 0 ? (
        <li>List item</li>
      ) : (
        items.map((item, i) => (
          <li key={`${i}-${item.slice(0, 12)}`}>{item}</li>
        ))
      )}
    </Tag>
  );
};

const ListContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const typeId = useId();
  const listStyle = (asString(block.props.listStyle, "disc") ||
    (block.props.ordered ? "decimal" : "disc")) as ListStyle;
  const raw = block.i18nProps?.[locale]?.items ?? block.props.items ?? "";
  const items = readItems(raw);
  const display =
    items.length > 0 ? items : ["First item", "Second item", "Third item"];

  const writeItems = (next: string[]) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = {
      ...(i18nProps[locale] ?? {}),
      items: itemsToStorage(next),
    };
    onChange({ i18nProps });
  };

  const handleItem = (index: number, value: string) => {
    const next = [...display];
    next[index] = value;
    writeItems(next);
  };

  const handleRemove = (index: number) => {
    writeItems(display.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    writeItems([...display, "New item"]);
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field" htmlFor={typeId}>
        <span className="pb-field-label">
          List type <span className="pb-field-label-muted">(shared)</span>
        </span>
        <select
          id={typeId}
          value={listStyle}
          aria-label="List type"
          onChange={(e) =>
            onChange({
              props: {
                ...block.props,
                listStyle: e.target.value,
                ordered: e.target.value !== "disc",
              },
            })
          }
        >
          {LIST_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <div className="pb-field">
        <span className="pb-field-label">List items</span>
        <div className="pb-list-items">
          {display.map((item, index) => (
            <div key={`li-${index}`} className="pb-list-item-row">
              <input
                type="text"
                value={item}
                aria-label={`List item ${index + 1}`}
                onChange={(e) => handleItem(index, e.target.value)}
              />
              <button
                type="button"
                className="pb-list-item-remove"
                aria-label={`Remove list item ${index + 1}`}
                onClick={() => handleRemove(index)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            className="pb-list-item-add"
            aria-label="Add list item"
            onClick={handleAdd}
          >
            + Add List
          </button>
        </div>
      </div>
    </div>
  );
};

export const listDefinition: BlockDefinition = {
  type: "list",
  label: "List",
  category: "basic",
  defaultProps: { listStyle: "disc", ordered: false },
  defaultI18nProps: {
    en: { items: "First item\nSecond item\nThird item" },
    ne: { items: "पहिलो\nदोस्रो\nतेस्रो" },
  },
  translatableProps: ["items"],
  sharedProps: ["listStyle", "ordered"],
  propsSchema: z
    .object({
      listStyle: z.string().optional(),
      ordered: z.boolean().optional(),
      items: z.string().optional(),
    })
    .passthrough(),
  render: ListElement,
  ContentFields: ListContentFields,
  source: "core",
};
