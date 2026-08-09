"use client";

import { useState } from "react";
import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { parseGoogleMapsEmbed } from "../parseEmbed";
import { asString } from "../shared";

export const MapElement = ({ block, props }: BlockRenderProps) => {
  const src = asString(props.src).trim();
  const title = asString(props.title, "Google Map") || "Google Map";
  const height = asString(props.height, "360px") || "360px";
  if (!src) {
    return (
      <div
        {...blockRootAttrs(block)}
        data-pb-type="map"
        style={{
          minHeight: height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed #d1d5db",
          color: "#9ca3af",
          fontSize: 13,
        }}
      >
        Paste a Google Maps embed iframe
      </div>
    );
  }
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="map"
      style={{ width: "100%", height, position: "relative" }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
        }}
      />
    </div>
  );
};

const MapContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const src = asString(block.props.src);
  const height = asString(block.props.height, "360px");
  const title = asString(block.props.title, "Google Map");
  const [paste, setPaste] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    const parsed = parseGoogleMapsEmbed(paste || src);
    if (!parsed) {
      setError(
        "Paste a Google Maps share → Embed a map iframe (https only), or an embed URL.",
      );
      return;
    }
    setError(null);
    onChange({
      props: {
        ...block.props,
        src: parsed.src,
        title: parsed.title || title,
        height: parsed.height
          ? `${parsed.height}${/^\d+$/.test(parsed.height) ? "px" : ""}`
          : height,
      },
    });
    setPaste("");
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Paste Google Maps iframe</span>
        <textarea
          rows={4}
          value={paste}
          placeholder={'<iframe src="https://www.google.com/maps/embed?…" …>'}
          aria-label="Google Maps iframe HTML"
          onChange={(e) => {
            setPaste(e.target.value);
            setError(null);
          }}
        />
      </label>
      <button
        type="button"
        className="pb-media-upload"
        style={{ width: "100%" }}
        onClick={handleParse}
      >
        Parse &amp; save embed
      </button>
      {error ? (
        <p className="pb-hint" role="alert">
          {error}
        </p>
      ) : (
        <p className="pb-hint">
          Google Maps → Share → Embed a map → copy the iframe. We store only the
          https src (not raw HTML).
        </p>
      )}
      <label className="pb-field">
        <span className="pb-field-label">Embed URL (stored)</span>
        <input
          type="text"
          value={src}
          aria-label="Map embed URL"
          onChange={(e) =>
            onChange({ props: { ...block.props, src: e.target.value } })
          }
        />
      </label>
      <div className="pb-size-row">
        <label className="pb-field">
          <span className="pb-field-label">Height</span>
          <input
            type="text"
            value={height}
            placeholder="360px"
            aria-label="Map height"
            onChange={(e) =>
              onChange({ props: { ...block.props, height: e.target.value } })
            }
          />
        </label>
        <label className="pb-field">
          <span className="pb-field-label">Title</span>
          <input
            type="text"
            value={title}
            aria-label="Map title"
            onChange={(e) =>
              onChange({ props: { ...block.props, title: e.target.value } })
            }
          />
        </label>
      </div>
    </div>
  );
};

export const mapDefinition: BlockDefinition = {
  type: "map",
  label: "Google Maps",
  category: "other",
  defaultProps: { src: "", height: "360px", title: "Google Map" },
  translatableProps: [],
  sharedProps: ["src", "height", "title"],
  propsSchema: z
    .object({
      src: z.string().optional(),
      height: z.string().optional(),
      title: z.string().optional(),
    })
    .passthrough(),
  render: MapElement,
  ContentFields: MapContentFields,
  source: "core",
};
