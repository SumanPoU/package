"use client";

import type { BlockContentFieldsProps } from "../../core/types";
import { ContainerBackgroundFields } from "../ContainerBackgroundFields";

export const GridContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const columns =
    typeof block.props.columns === "string"
      ? block.props.columns
      : typeof block.props.columns === "number"
        ? String(block.props.columns)
        : "2";
  const gap = typeof block.props.gap === "string" ? block.props.gap : "16px";
  const rowGap =
    typeof block.props.rowGap === "string" ? block.props.rowGap : "";
  const align =
    typeof block.props.alignItems === "string"
      ? block.props.alignItems
      : "stretch";
  const justify =
    typeof block.props.justifyItems === "string"
      ? block.props.justifyItems
      : "stretch";

  const patch = (next: Record<string, unknown>) => {
    onChange({ props: { ...block.props, ...next } });
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field" htmlFor={`pb-grid-cols-${block.id}`}>
        <span className="pb-field-label">Columns</span>
        <select
          id={`pb-grid-cols-${block.id}`}
          value={columns}
          aria-label="Grid columns"
          onChange={(e) => patch({ columns: e.target.value })}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="12">12</option>
        </select>
      </label>
      <div className="pb-size-row">
        <label className="pb-field" htmlFor={`pb-grid-gap-${block.id}`}>
          <span className="pb-field-label">Column gap</span>
          <input
            id={`pb-grid-gap-${block.id}`}
            type="text"
            value={gap}
            placeholder="16px"
            aria-label="Grid column gap"
            onChange={(e) => patch({ gap: e.target.value })}
          />
        </label>
        <label className="pb-field" htmlFor={`pb-grid-rowgap-${block.id}`}>
          <span className="pb-field-label">Row gap</span>
          <input
            id={`pb-grid-rowgap-${block.id}`}
            type="text"
            value={rowGap}
            placeholder="same as column"
            aria-label="Grid row gap"
            onChange={(e) => patch({ rowGap: e.target.value })}
          />
        </label>
      </div>
      <div className="pb-size-row">
        <label className="pb-field" htmlFor={`pb-grid-align-${block.id}`}>
          <span className="pb-field-label">Align items</span>
          <select
            id={`pb-grid-align-${block.id}`}
            value={align}
            aria-label="Align items"
            onChange={(e) => patch({ alignItems: e.target.value })}
          >
            <option value="stretch">Stretch</option>
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </label>
        <label className="pb-field" htmlFor={`pb-grid-justify-${block.id}`}>
          <span className="pb-field-label">Justify items</span>
          <select
            id={`pb-grid-justify-${block.id}`}
            value={justify}
            aria-label="Justify items"
            onChange={(e) => patch({ justifyItems: e.target.value })}
          >
            <option value="stretch">Stretch</option>
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </label>
      </div>
      <ContainerBackgroundFields
        block={block}
        onChange={onChange}
        idPrefix={`pb-grid-${block.id}`}
      />
    </div>
  );
};
