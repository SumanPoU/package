"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { MediaUrlField } from "../MediaUrlField";
import { asString } from "../shared";

const toEmbedSrc = (raw: string): string => {
  const url = raw.trim();
  if (!url) return "";
  const yt =
    url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/i,
    ) ?? null;
  if (yt?.[1]) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
};

export const VideoElement = ({ block, props }: BlockRenderProps) => {
  const src = toEmbedSrc(asString(props.src));
  const title = asString(props.title, "Video");
  if (!src) {
    return (
      <div
        {...blockRootAttrs(block)}
        data-pb-type="video"
        style={{ aspectRatio: "16 / 9", width: "100%" }}
        aria-label="Empty video"
      />
    );
  }
  const isFile = /\.(mp4|webm|ogg)(\?|$)/i.test(src);
  if (isFile) {
    return (
      <video
        {...blockRootAttrs(block)}
        data-pb-type="video"
        src={src}
        controls
        style={{ width: "100%", maxWidth: "100%", height: "auto" }}
        title={title}
      >
        <track kind="captions" />
      </video>
    );
  }
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="video"
      style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}
    >
      <iframe
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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

const VideoContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const src = typeof block.props.src === "string" ? block.props.src : "";
  const title =
    typeof block.i18nProps?.[locale]?.title === "string"
      ? (block.i18nProps[locale]!.title as string)
      : "";

  return (
    <div className="pb-content-fields">
      <MediaUrlField
        label="Video URL (YouTube, Vimeo, or mp4)"
        value={src}
        onChange={(next) => onChange({ props: { ...block.props, src: next } })}
        placeholder="https://www.youtube.com/watch?v=…"
        hint="Paste a URL. Upload stores a media URL or Base64 (prefer mp4 via CDN)."
        accept="video/*,image/*"
        requireImageMime={false}
      />
      <label className="pb-field">
        <span className="pb-field-label">Title</span>
        <input
          type="text"
          value={title}
          aria-label="Video title"
          onChange={(e) => {
            const i18nProps = { ...(block.i18nProps ?? {}) };
            i18nProps[locale] = {
              ...(i18nProps[locale] ?? {}),
              title: e.target.value,
            };
            onChange({ i18nProps });
          }}
        />
      </label>
    </div>
  );
};

export const videoDefinition: BlockDefinition = {
  type: "video",
  label: "Video",
  category: "other",
  defaultProps: { src: "" },
  defaultI18nProps: { en: { title: "Video" }, ne: { title: "भिडियो" } },
  translatableProps: ["title"],
  sharedProps: ["src"],
  propsSchema: z
    .object({
      src: z.string().optional(),
      title: z.string().optional(),
    })
    .passthrough(),
  render: VideoElement,
  ContentFields: VideoContentFields,
  source: "core",
};
