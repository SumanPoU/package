"use client";

import type { BlockContentFieldsProps } from "../core/types";
import { MediaUrlField } from "./MediaUrlField";

type BgProps = Pick<BlockContentFieldsProps, "block" | "onChange"> & {
  idPrefix: string;
};

/**
 * Background Type: Color | Image, with upload/Base64, opacity, dark overlay.
 * Used by box / flex / grid ContentFields.
 */
export const ContainerBackgroundFields = ({
  block,
  onChange,
  idPrefix,
}: BgProps) => {
  const type =
    block.props.backgroundType === "color" ||
    block.props.backgroundType === "image"
      ? block.props.backgroundType
      : typeof block.props.backgroundImage === "string" &&
          block.props.backgroundImage.trim()
        ? "image"
        : "color";

  const color =
    typeof block.props.backgroundColor === "string"
      ? block.props.backgroundColor
      : "";
  const image =
    typeof block.props.backgroundImage === "string"
      ? block.props.backgroundImage
      : "";
  const overlay =
    block.props.backgroundOverlay !== undefined &&
    block.props.backgroundOverlay !== ""
      ? String(block.props.backgroundOverlay)
      : "0";
  const opacity =
    block.props.backgroundOpacity !== undefined &&
    block.props.backgroundOpacity !== ""
      ? String(block.props.backgroundOpacity)
      : "100";
  const size =
    typeof block.props.backgroundSize === "string"
      ? block.props.backgroundSize
      : "cover";
  const position =
    typeof block.props.backgroundPosition === "string"
      ? block.props.backgroundPosition
      : "center";

  const patch = (next: Record<string, unknown>) => {
    onChange({ props: { ...block.props, ...next } });
  };

  return (
    <div className="pb-content-fields pb-bg-fields">
      <div className="pb-field">
        <span className="pb-field-label">Background Type</span>
        <div className="pb-bg-type" role="group" aria-label="Background type">
          <button
            type="button"
            className={
              type === "color" ? "pb-bg-type-btn is-active" : "pb-bg-type-btn"
            }
            aria-pressed={type === "color"}
            aria-label="Background color"
            onClick={() => patch({ backgroundType: "color" })}
          >
            Color
          </button>
          <button
            type="button"
            className={
              type === "image" ? "pb-bg-type-btn is-active" : "pb-bg-type-btn"
            }
            aria-pressed={type === "image"}
            aria-label="Background image"
            onClick={() => patch({ backgroundType: "image" })}
          >
            Image
          </button>
        </div>
      </div>

      {type === "color" ? (
        <label className="pb-field" htmlFor={`${idPrefix}-bg-color`}>
          <span className="pb-field-label">Background Color</span>
          <div className="pb-media-row">
            <input
              id={`${idPrefix}-bg-color`}
              type="color"
              value={color && /^#/.test(color) ? color.slice(0, 7) : "#ffffff"}
              aria-label="Background color picker"
              onChange={(e) => patch({ backgroundColor: e.target.value })}
              style={{ width: 40, flex: "0 0 auto" }}
            />
            <input
              type="text"
              value={color}
              placeholder="#ffffff"
              aria-label="Background color"
              onChange={(e) => patch({ backgroundColor: e.target.value })}
            />
          </div>
        </label>
      ) : (
        <>
          <MediaUrlField
            id={`${idPrefix}-bg-img`}
            label="Background Image"
            value={image}
            onChange={(backgroundImage) => patch({ backgroundImage })}
            placeholder="https://… or Upload"
          />
          <div className="pb-size-row">
            <label className="pb-field" htmlFor={`${idPrefix}-bg-size`}>
              <span className="pb-field-label">Size</span>
              <select
                id={`${idPrefix}-bg-size`}
                value={size}
                aria-label="Background size"
                onChange={(e) => patch({ backgroundSize: e.target.value })}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
                <option value="100% 100%">Stretch</option>
              </select>
            </label>
            <label className="pb-field" htmlFor={`${idPrefix}-bg-pos`}>
              <span className="pb-field-label">Position</span>
              <select
                id={`${idPrefix}-bg-pos`}
                value={position}
                aria-label="Background position"
                onChange={(e) => patch({ backgroundPosition: e.target.value })}
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </label>
          </div>
        </>
      )}

      <label className="pb-field" htmlFor={`${idPrefix}-bg-opacity`}>
        <span className="pb-field-label">
          Opacity <span className="pb-field-label-muted">{opacity}%</span>
        </span>
        <input
          id={`${idPrefix}-bg-opacity`}
          type="range"
          min={0}
          max={100}
          value={opacity}
          aria-label="Background opacity"
          onChange={(e) => patch({ backgroundOpacity: e.target.value })}
        />
      </label>

      <label className="pb-field" htmlFor={`${idPrefix}-bg-overlay`}>
        <span className="pb-field-label">
          Dark overlay <span className="pb-field-label-muted">{overlay}%</span>
        </span>
        <input
          id={`${idPrefix}-bg-overlay`}
          type="range"
          min={0}
          max={100}
          value={overlay}
          aria-label="Dark overlay"
          onChange={(e) => patch({ backgroundOverlay: e.target.value })}
        />
      </label>
    </div>
  );
};
