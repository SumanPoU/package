"use client";

import { useId } from "react";
import { getBlockStyle } from "../../core/blockStyleCss";
import type { BlockContentFieldsProps } from "../../core/types";
import { LinkFields } from "../LinkFields";
import { MediaUrlField } from "../MediaUrlField";
import { DEFAULT_IMAGE_SRC } from "./defaultSrc";

const CONTENT_WIDTHS = [
  { value: "full", label: "Full width" },
  { value: "large", label: "Large - 1024px" },
  { value: "medium", label: "Medium - 768px" },
  { value: "small", label: "Small - 480px" },
  { value: "custom", label: "Custom" },
] as const;

export const ImageContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const altId = useId();
  const widthId = useId();
  const heightId = useId();
  const contentWidthId = useId();

  const rawSrc = typeof block.props.src === "string" ? block.props.src : "";
  const previewSrc = rawSrc.trim() || DEFAULT_IMAGE_SRC;
  const width = typeof block.props.width === "string" ? block.props.width : "";
  const height =
    typeof block.props.height === "string" ? block.props.height : "";
  const contentWidth =
    typeof block.props.contentWidth === "string"
      ? block.props.contentWidth
      : "large";
  const alt =
    typeof block.i18nProps?.[locale]?.alt === "string"
      ? (block.i18nProps[locale]!.alt as string)
      : "";
  const align = getBlockStyle(block).align ?? "left";

  const handleAlt = (value: string) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = { ...(i18nProps[locale] ?? {}), alt: value };
    onChange({ i18nProps });
  };

  const handlePatchProps = (patch: Record<string, unknown>) => {
    onChange({ props: { ...block.props, ...patch } });
  };

  const handleAlign = (next: "left" | "center" | "right") => {
    onChange({
      style: {
        ...getBlockStyle(block),
        align: next,
      },
    });
  };

  return (
    <div className="pb-content-fields">
      <div className="pb-image-preview">
        <img src={previewSrc} alt="" className="pb-image-preview-img" />
      </div>

      <MediaUrlField
        label="Image URL (shared)"
        value={rawSrc}
        onChange={(src) => handlePatchProps({ src })}
        placeholder={DEFAULT_IMAGE_SRC}
        fallbackOnEmpty={DEFAULT_IMAGE_SRC}
      />

      <label className="pb-field" htmlFor={contentWidthId}>
        <span className="pb-field-label">Content Width</span>
        <select
          id={contentWidthId}
          value={contentWidth}
          aria-label="Content width"
          onChange={(e) => handlePatchProps({ contentWidth: e.target.value })}
        >
          {CONTENT_WIDTHS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </label>

      {contentWidth === "custom" ? (
        <div className="pb-size-row">
          <label className="pb-field" htmlFor={widthId}>
            <span className="pb-field-label">Width</span>
            <input
              id={widthId}
              type="text"
              value={width}
              placeholder="100% or 400px"
              aria-label="Image width"
              onChange={(e) => handlePatchProps({ width: e.target.value })}
            />
          </label>
          <label className="pb-field" htmlFor={heightId}>
            <span className="pb-field-label">Height</span>
            <input
              id={heightId}
              type="text"
              value={height}
              placeholder="auto or 240px"
              aria-label="Image height"
              onChange={(e) => handlePatchProps({ height: e.target.value })}
            />
          </label>
        </div>
      ) : null}

      <div className="pb-field">
        <span className="pb-field-label">Alignment</span>
        <div className="pb-align-row" role="group" aria-label="Alignment">
          {(
            [
              ["left", "Left"],
              ["center", "Center"],
              ["right", "Right"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={
                align === id ? "pb-align-btn is-active" : "pb-align-btn"
              }
              aria-pressed={align === id}
              aria-label={label}
              onClick={() => handleAlign(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <LinkFields
        block={block}
        onChange={onChange}
        idPrefix={`img-${block.id}`}
      />

      <label className="pb-field" htmlFor={altId}>
        <span className="pb-field-label">Alt text</span>
        <input
          id={altId}
          type="text"
          value={alt}
          aria-label="Image alt text"
          onChange={(e) => handleAlt(e.target.value)}
        />
      </label>
    </div>
  );
};
