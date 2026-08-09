"use client";

import { useState } from "react";
import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { parseEmbedInput } from "../parseEmbed";
import { asString } from "../shared";

export const EmbedElement = ({ block, props }: BlockRenderProps) => {
  const src = asString(props.src).trim();
  const title = asString(props.title, "Embed") || "Embed";
  const height = asString(props.height, "400px") || "400px";
  if (!src) {
    return (
      <div
        {...blockRootAttrs(block)}
        data-pb-type="embed"
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
        Paste an iframe or https URL
      </div>
    );
  }
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="embed"
      style={{ width: "100%", height, position: "relative" }}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        referrerPolicy="no-referrer"
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

const EmbedContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const src = asString(block.props.src);
  const height = asString(block.props.height, "400px");
  const title = asString(block.props.title, "Embed");
  const [paste, setPaste] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleParse = () => {
    const parsed = parseEmbedInput(paste || src);
    if (!parsed) {
      setError("Paste an https iframe snippet or https URL.");
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
        <span className="pb-field-label">Paste iframe HTML or URL</span>
        <textarea
          rows={4}
          value={paste}
          placeholder={'<iframe src="https://…"></iframe>'}
          aria-label="Embed iframe HTML"
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
        Parse &amp; save
      </button>
      {error ? (
        <p className="pb-hint" role="alert">
          {error}
        </p>
      ) : (
        <p className="pb-hint">
          Only the https <code>src</code> is stored. Scripts in the paste are
          discarded.
        </p>
      )}
      <label className="pb-field">
        <span className="pb-field-label">Embed URL (stored)</span>
        <input
          type="url"
          value={src}
          aria-label="Embed URL"
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
            aria-label="Embed height"
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
            aria-label="Embed title"
            onChange={(e) =>
              onChange({ props: { ...block.props, title: e.target.value } })
            }
          />
        </label>
      </div>
    </div>
  );
};

export const embedDefinition: BlockDefinition = {
  type: "embed",
  label: "Embed / iframe",
  category: "embeds",
  defaultProps: { src: "", height: "400px", title: "Embed" },
  translatableProps: [],
  sharedProps: ["src", "height", "title"],
  propsSchema: z
    .object({
      src: z.string().optional(),
      height: z.string().optional(),
      title: z.string().optional(),
    })
    .passthrough(),
  render: EmbedElement,
  ContentFields: EmbedContentFields,
  source: "core",
};
