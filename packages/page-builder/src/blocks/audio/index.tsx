"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

export const AudioElement = ({ block, props }: BlockRenderProps) => {
  const src = asString(props.src).trim();
  const title = asString(props.title, "Audio");
  if (!src) {
    return (
      <div {...blockRootAttrs(block)} data-pb-type="audio">
        Paste an audio or SoundCloud URL
      </div>
    );
  }
  const isSoundCloud = /soundcloud\.com/i.test(src);
  if (isSoundCloud) {
    const embed = src.includes("w.soundcloud.com")
      ? src
      : `https://w.soundcloud.com/player/?url=${encodeURIComponent(src)}`;
    return (
      <div
        {...blockRootAttrs(block)}
        data-pb-type="audio"
        style={{ width: "100%" }}
      >
        <iframe
          title={title || "SoundCloud"}
          src={embed}
          allow="autoplay"
          loading="lazy"
          style={{ width: "100%", height: 166, border: 0 }}
        />
      </div>
    );
  }
  return (
    <audio
      {...blockRootAttrs(block)}
      data-pb-type="audio"
      controls
      src={src}
      preload="metadata"
      style={{ width: "100%" }}
    >
      <track kind="captions" />
    </audio>
  );
};

const AudioContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const src = asString(block.props.src);
  const title = asString(block.props.title, "Audio");
  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Audio / SoundCloud URL</span>
        <input
          type="url"
          value={src}
          aria-label="Audio source URL"
          onChange={(e) =>
            onChange({ props: { ...block.props, src: e.target.value } })
          }
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Title</span>
        <input
          type="text"
          value={title}
          aria-label="Audio title"
          onChange={(e) =>
            onChange({ props: { ...block.props, title: e.target.value } })
          }
        />
      </label>
    </div>
  );
};

export const audioDefinition: BlockDefinition = {
  type: "audio",
  label: "Audio",
  category: "media",
  defaultProps: { src: "", title: "Audio" },
  translatableProps: [],
  sharedProps: ["src", "title"],
  propsSchema: z
    .object({
      src: z.string().optional(),
      title: z.string().optional(),
    })
    .passthrough(),
  render: AudioElement,
  ContentFields: AudioContentFields,
  source: "core",
};
