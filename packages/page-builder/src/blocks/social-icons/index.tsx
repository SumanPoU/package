"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { linkTargetRel } from "../shared";

type SocialItem = { label: string; href: string; symbol: string };

const DEFAULT_ITEMS: SocialItem[] = [
  { label: "Facebook", href: "https://facebook.com", symbol: "f" },
  { label: "X", href: "https://x.com", symbol: "𝕏" },
  { label: "Instagram", href: "https://instagram.com", symbol: "◎" },
];

const readItems = (raw: unknown): SocialItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return {
      label: String(r.label ?? ""),
      href: String(r.href ?? ""),
      symbol: String(r.symbol ?? "•"),
    };
  });
};

export const SocialIconsElement = ({ block, props }: BlockRenderProps) => {
  const items = readItems(props.items);
  const list = items.length ? items : DEFAULT_ITEMS;
  const rel = linkTargetRel({ openInNewWindow: true });
  return (
    <ul
      {...blockRootAttrs(block)}
      data-pb-type="social-icons"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {list.map((item, i) => (
        <li key={`${i}-${item.label}`}>
          <a
            href={item.href || "#"}
            aria-label={item.label || "Social link"}
            {...rel}
            style={{
              display: "inline-flex",
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid currentColor",
              borderRadius: "999px",
              textDecoration: "none",
            }}
          >
            <span aria-hidden>{item.symbol || "•"}</span>
          </a>
        </li>
      ))}
    </ul>
  );
};

const SocialIconsContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const items = readItems(block.props.items);
  const display = items.length ? items : DEFAULT_ITEMS.map((x) => ({ ...x }));

  const write = (next: SocialItem[]) => {
    onChange({ props: { ...block.props, items: next } });
  };

  return (
    <div className="pb-content-fields">
      {display.map((item, index) => (
        <div key={index} className="pb-list-item-row">
          <label className="pb-field">
            <span className="pb-field-label">Label</span>
            <input
              type="text"
              value={item.label}
              aria-label={`Social label ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, label: e.target.value };
                write(next);
              }}
            />
          </label>
          <label className="pb-field">
            <span className="pb-field-label">URL</span>
            <input
              type="url"
              value={item.href}
              aria-label={`Social URL ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, href: e.target.value };
                write(next);
              }}
            />
          </label>
          <label className="pb-field">
            <span className="pb-field-label">Symbol</span>
            <input
              type="text"
              value={item.symbol}
              aria-label={`Social symbol ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, symbol: e.target.value };
                write(next);
              }}
            />
          </label>
          <button
            type="button"
            className="pb-media-upload"
            aria-label={`Remove social ${index + 1}`}
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
          write([...display, { label: "Link", href: "https://", symbol: "•" }])
        }
      >
        + Add social
      </button>
    </div>
  );
};

export const socialIconsDefinition: BlockDefinition = {
  type: "social-icons",
  label: "Social Icons",
  category: "basic",
  defaultProps: { items: DEFAULT_ITEMS },
  translatableProps: [],
  sharedProps: ["items"],
  propsSchema: z
    .object({
      items: z
        .array(
          z.object({
            label: z.string(),
            href: z.string(),
            symbol: z.string(),
          }),
        )
        .optional(),
    })
    .passthrough(),
  render: SocialIconsElement,
  ContentFields: SocialIconsContentFields,
  source: "core",
};
