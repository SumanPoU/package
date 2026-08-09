"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

const PRESET_ICONS = [
  "★",
  "♥",
  "●",
  "■",
  "▲",
  "◆",
  "✓",
  "→",
  "✉",
  "☎",
  "⌂",
  "⚙",
];

export const IconElement = ({ block, props }: BlockRenderProps) => {
  const symbol = asString(props.symbol, "★") || "★";
  const size = asString(props.size, "32px") || "32px";
  const color = asString(props.color).trim();
  return (
    <span
      {...blockRootAttrs(block)}
      data-pb-type="icon"
      role="img"
      aria-label={asString(props.label, "Icon") || "Icon"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size,
        lineHeight: 1,
        color: color || undefined,
      }}
    >
      {symbol}
    </span>
  );
};

const IconContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const symbol = asString(block.props.symbol, "★");
  const size = asString(block.props.size, "32px");
  const color = asString(block.props.color);
  const label = asString(block.props.label, "Icon");

  const patch = (next: Record<string, unknown>) => {
    onChange({ props: { ...block.props, ...next } });
  };

  return (
    <div className="pb-content-fields">
      <div className="pb-field">
        <span className="pb-field-label">Icon</span>
        <div className="pb-icon-grid" role="group" aria-label="Icon presets">
          {PRESET_ICONS.map((ico) => (
            <button
              key={ico}
              type="button"
              className={
                symbol === ico ? "pb-icon-pick is-active" : "pb-icon-pick"
              }
              aria-pressed={symbol === ico}
              aria-label={`Icon ${ico}`}
              onClick={() => patch({ symbol: ico })}
            >
              {ico}
            </button>
          ))}
        </div>
      </div>
      <label className="pb-field">
        <span className="pb-field-label">Custom symbol</span>
        <input
          type="text"
          value={symbol}
          aria-label="Custom icon symbol"
          onChange={(e) => patch({ symbol: e.target.value })}
        />
      </label>
      <div className="pb-size-row">
        <label className="pb-field">
          <span className="pb-field-label">Size</span>
          <input
            type="text"
            value={size}
            placeholder="32px"
            aria-label="Icon size"
            onChange={(e) => patch({ size: e.target.value })}
          />
        </label>
        <label className="pb-field">
          <span className="pb-field-label">Color</span>
          <input
            type="text"
            value={color}
            placeholder="#111 or currentColor"
            aria-label="Icon color"
            onChange={(e) => patch({ color: e.target.value })}
          />
        </label>
      </div>
      <label className="pb-field">
        <span className="pb-field-label">Accessible label</span>
        <input
          type="text"
          value={label}
          aria-label="Icon accessible label"
          onChange={(e) => patch({ label: e.target.value })}
        />
      </label>
    </div>
  );
};

export const iconDefinition: BlockDefinition = {
  type: "icon",
  label: "Icon",
  category: "basic",
  defaultProps: { symbol: "★", size: "32px", label: "Icon" },
  translatableProps: [],
  sharedProps: ["symbol", "size", "color", "label"],
  propsSchema: z
    .object({
      symbol: z.string().optional(),
      size: z.string().optional(),
      color: z.string().optional(),
      label: z.string().optional(),
    })
    .passthrough(),
  render: IconElement,
  ContentFields: IconContentFields,
  source: "core",
};
