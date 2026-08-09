"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

type GalleryItem = { src: string; alt: string };

const readItems = (raw: unknown): GalleryItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return { src: String(r.src ?? ""), alt: String(r.alt ?? "") };
  });
};

export const GalleryElement = ({ block, props }: BlockRenderProps) => {
  const cols = Math.max(1, Number(props.columns) || 3);
  const gap = asString(props.gap, "0.5rem") || "0.5rem";
  const items = readItems(props.items).filter((i) => i.src.trim());
  const list =
    items.length > 0
      ? items
      : [
          {
            src: "https://picsum.photos/seed/pb-g1/400/300",
            alt: "Gallery image 1",
          },
          {
            src: "https://picsum.photos/seed/pb-g2/400/300",
            alt: "Gallery image 2",
          },
          {
            src: "https://picsum.photos/seed/pb-g3/400/300",
            alt: "Gallery image 3",
          },
        ];
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="gallery"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap,
      }}
    >
      {list.map((item, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${i}-${item.src}`}
          src={item.src}
          alt={item.alt || `Gallery image ${i + 1}`}
          loading="lazy"
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      ))}
    </div>
  );
};

const GalleryContentFields = ({ block, onChange }: BlockContentFieldsProps) => {
  const items = readItems(block.props.items);
  const display = items.length > 0 ? items : [{ src: "", alt: "" }];
  const columns = String(block.props.columns ?? 3);
  const gap = asString(block.props.gap, "0.5rem");

  const write = (next: GalleryItem[]) => {
    onChange({ props: { ...block.props, items: next } });
  };

  return (
    <div className="pb-content-fields">
      <div className="pb-size-row">
        <label className="pb-field">
          <span className="pb-field-label">Columns</span>
          <input
            type="number"
            min={1}
            max={6}
            value={columns}
            aria-label="Gallery columns"
            onChange={(e) =>
              onChange({
                props: { ...block.props, columns: Number(e.target.value) || 3 },
              })
            }
          />
        </label>
        <label className="pb-field">
          <span className="pb-field-label">Gap</span>
          <input
            type="text"
            value={gap}
            aria-label="Gallery gap"
            onChange={(e) =>
              onChange({ props: { ...block.props, gap: e.target.value } })
            }
          />
        </label>
      </div>
      {display.map((item, index) => (
        <div key={index} className="pb-list-item-row">
          <label className="pb-field">
            <span className="pb-field-label">Image URL</span>
            <input
              type="url"
              value={item.src}
              aria-label={`Gallery src ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, src: e.target.value };
                write(next);
              }}
            />
          </label>
          <label className="pb-field">
            <span className="pb-field-label">Alt</span>
            <input
              type="text"
              value={item.alt}
              aria-label={`Gallery alt ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...item, alt: e.target.value };
                write(next);
              }}
            />
          </label>
          <button
            type="button"
            className="pb-media-upload"
            aria-label={`Remove gallery image ${index + 1}`}
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
        onClick={() => write([...display, { src: "", alt: "" }])}
      >
        + Add image
      </button>
    </div>
  );
};

export const galleryDefinition: BlockDefinition = {
  type: "gallery",
  label: "Image Gallery",
  category: "media",
  defaultProps: {
    columns: 3,
    gap: "0.5rem",
    items: [
      {
        src: "https://picsum.photos/seed/pb-g1/400/300",
        alt: "Gallery image 1",
      },
      {
        src: "https://picsum.photos/seed/pb-g2/400/300",
        alt: "Gallery image 2",
      },
      {
        src: "https://picsum.photos/seed/pb-g3/400/300",
        alt: "Gallery image 3",
      },
    ],
  },
  translatableProps: [],
  sharedProps: ["columns", "gap", "items"],
  propsSchema: z
    .object({
      columns: z.number().optional(),
      gap: z.string().optional(),
      items: z.array(z.object({ src: z.string(), alt: z.string() })).optional(),
    })
    .passthrough(),
  render: GalleryElement,
  ContentFields: GalleryContentFields,
  source: "core",
};
