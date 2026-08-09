"use client";

import { useState } from "react";
import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";

type Slide = { src: string; alt: string };

const readSlides = (raw: unknown): Slide[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    return { src: String(r.src ?? ""), alt: String(r.alt ?? "") };
  });
};

export const CarouselElement = ({ block, props }: BlockRenderProps) => {
  const slides = readSlides(props.slides).filter((s) => s.src.trim());
  const list =
    slides.length > 0
      ? slides
      : [
          {
            src: "https://picsum.photos/seed/pb-c1/800/400",
            alt: "Slide 1",
          },
          {
            src: "https://picsum.photos/seed/pb-c2/800/400",
            alt: "Slide 2",
          },
        ];
  const [index, setIndex] = useState(0);
  const safe = ((index % list.length) + list.length) % list.length;
  const current = list[safe]!;

  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="carousel"
      style={{ position: "relative", width: "100%" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.src}
        alt={current.alt || `Slide ${safe + 1}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "0.5rem",
          gap: "0.5rem",
        }}
      >
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => setIndex((i) => i - 1)}
        >
          Prev
        </button>
        <span aria-live="polite">
          {safe + 1} / {list.length}
        </span>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => setIndex((i) => i + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const CarouselContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const slides = readSlides(block.props.slides);
  const display = slides.length > 0 ? slides : [{ src: "", alt: "" }];
  const write = (next: Slide[]) => {
    onChange({ props: { ...block.props, slides: next } });
  };
  return (
    <div className="pb-content-fields">
      {display.map((slide, index) => (
        <div key={index} className="pb-list-item-row">
          <label className="pb-field">
            <span className="pb-field-label">Slide URL</span>
            <input
              type="url"
              value={slide.src}
              aria-label={`Slide src ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...slide, src: e.target.value };
                write(next);
              }}
            />
          </label>
          <label className="pb-field">
            <span className="pb-field-label">Alt</span>
            <input
              type="text"
              value={slide.alt}
              aria-label={`Slide alt ${index + 1}`}
              onChange={(e) => {
                const next = [...display];
                next[index] = { ...slide, alt: e.target.value };
                write(next);
              }}
            />
          </label>
          <button
            type="button"
            className="pb-media-upload"
            aria-label={`Remove slide ${index + 1}`}
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
        + Add slide
      </button>
    </div>
  );
};

export const carouselDefinition: BlockDefinition = {
  type: "carousel",
  label: "Image Carousel",
  category: "media",
  defaultProps: {
    slides: [
      {
        src: "https://picsum.photos/seed/pb-c1/800/400",
        alt: "Slide 1",
      },
      {
        src: "https://picsum.photos/seed/pb-c2/800/400",
        alt: "Slide 2",
      },
    ],
  },
  translatableProps: [],
  sharedProps: ["slides"],
  propsSchema: z
    .object({
      slides: z
        .array(z.object({ src: z.string(), alt: z.string() }))
        .optional(),
    })
    .passthrough(),
  render: CarouselElement,
  ContentFields: CarouselContentFields,
  source: "core",
};
