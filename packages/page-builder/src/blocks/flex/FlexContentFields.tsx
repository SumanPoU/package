"use client";

import type { BlockContentFieldsProps } from "../../core/types";
import { ContainerBackgroundFields } from "../ContainerBackgroundFields";

export const FlexContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const direction =
    typeof block.props.direction === "string" ? block.props.direction : "row";
  const justify =
    typeof block.props.justifyContent === "string"
      ? block.props.justifyContent
      : "flex-start";
  const align =
    typeof block.props.alignItems === "string"
      ? block.props.alignItems
      : "stretch";
  const gap = typeof block.props.gap === "string" ? block.props.gap : "16px";
  const wrap =
    typeof block.props.flexWrap === "string" ? block.props.flexWrap : "nowrap";

  const patch = (next: Record<string, unknown>) => {
    onChange({ props: { ...block.props, ...next } });
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field" htmlFor={`pb-flex-dir-${block.id}`}>
        <span className="pb-field-label">Direction</span>
        <select
          id={`pb-flex-dir-${block.id}`}
          value={direction}
          aria-label="Flex direction"
          onChange={(e) => patch({ direction: e.target.value })}
        >
          <option value="row">Row</option>
          <option value="column">Column</option>
          <option value="row-reverse">Row reverse</option>
          <option value="column-reverse">Column reverse</option>
        </select>
      </label>
      <label className="pb-field" htmlFor={`pb-flex-justify-${block.id}`}>
        <span className="pb-field-label">Justify</span>
        <select
          id={`pb-flex-justify-${block.id}`}
          value={justify}
          aria-label="Justify content"
          onChange={(e) => patch({ justifyContent: e.target.value })}
        >
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="space-between">Space between</option>
          <option value="space-around">Space around</option>
          <option value="space-evenly">Space evenly</option>
        </select>
      </label>
      <label className="pb-field" htmlFor={`pb-flex-align-${block.id}`}>
        <span className="pb-field-label">Align items</span>
        <select
          id={`pb-flex-align-${block.id}`}
          value={align}
          aria-label="Align items"
          onChange={(e) => patch({ alignItems: e.target.value })}
        >
          <option value="stretch">Stretch</option>
          <option value="flex-start">Start</option>
          <option value="center">Center</option>
          <option value="flex-end">End</option>
          <option value="baseline">Baseline</option>
        </select>
      </label>
      <div className="pb-size-row">
        <label className="pb-field" htmlFor={`pb-flex-gap-${block.id}`}>
          <span className="pb-field-label">Gap</span>
          <input
            id={`pb-flex-gap-${block.id}`}
            type="text"
            value={gap}
            placeholder="16px"
            aria-label="Flex gap"
            onChange={(e) => patch({ gap: e.target.value })}
          />
        </label>
        <label className="pb-field" htmlFor={`pb-flex-wrap-${block.id}`}>
          <span className="pb-field-label">Wrap</span>
          <select
            id={`pb-flex-wrap-${block.id}`}
            value={wrap}
            aria-label="Flex wrap"
            onChange={(e) => patch({ flexWrap: e.target.value })}
          >
            <option value="nowrap">No wrap</option>
            <option value="wrap">Wrap</option>
            <option value="wrap-reverse">Wrap reverse</option>
          </select>
        </label>
      </div>
      <ContainerBackgroundFields
        block={block}
        onChange={onChange}
        idPrefix={`pb-flex-${block.id}`}
      />
    </div>
  );
};
