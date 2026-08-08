"use client";

import { useId, useRef, useState } from "react";

import type { BlockContentFieldsProps } from "../../core/types";
import { DEFAULT_IMAGE_SRC } from "./defaultSrc";

const MAX_BASE64_BYTES = 1_500_000; // ~1.5MB — keep page JSON sane

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });

export const ImageContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const srcId = useId();
  const altId = useId();
  const widthId = useId();
  const heightId = useId();
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const rawSrc = typeof block.props.src === "string" ? block.props.src : "";
  const width =
    typeof block.props.width === "string" ? block.props.width : "";
  const height =
    typeof block.props.height === "string" ? block.props.height : "";
  const alt =
    typeof block.i18nProps?.[locale]?.alt === "string"
      ? (block.i18nProps[locale]!.alt as string)
      : "";

  const handleAlt = (value: string) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = { ...(i18nProps[locale] ?? {}), alt: value };
    onChange({ i18nProps });
  };

  const handleSetSrc = (next: string) => {
    setStatus(null);
    onChange({ props: { ...block.props, src: next } });
  };

  const handlePatchSize = (patch: { width?: string; height?: string }) => {
    onChange({ props: { ...block.props, ...patch } });
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Choose an image file (PNG, JPG, WebP, GIF, …).");
      return;
    }
    if (file.size > MAX_BASE64_BYTES) {
      setStatus(
        "File is too large for Base64 in page JSON. Use a CDN URL instead (max ~1.5MB).",
      );
      return;
    }
    setIsConverting(true);
    setStatus(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      handleSetSrc(dataUrl);
      setStatus("Converted to Base64.");
    } catch {
      setStatus("Could not convert that file to Base64.");
    } finally {
      setIsConverting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="pb-content-fields">
      <div className="pb-field">
        <span className="pb-field-label" id={`${srcId}-label`}>
          Image URL{" "}
          <span className="pb-field-label-muted">(shared)</span>
        </span>
        <div className="pb-media-row">
          <input
            id={srcId}
            type="text"
            value={rawSrc}
            placeholder={DEFAULT_IMAGE_SRC}
            aria-labelledby={`${srcId}-label`}
            onChange={(e) => handleSetSrc(e.target.value)}
            onBlur={() => {
              if (rawSrc.trim() === "") handleSetSrc(DEFAULT_IMAGE_SRC);
            }}
          />
          <input
            ref={fileRef}
            id={fileId}
            type="file"
            accept="image/*"
            hidden
            aria-label="Upload image and convert to Base64"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="pb-media-upload"
            disabled={isConverting}
            aria-label="Upload image and convert to Base64"
            onClick={() => fileRef.current?.click()}
          >
            {isConverting ? "…" : "Upload"}
          </button>
        </div>
        {status ? (
          <p className="pb-hint" role="status">
            {status}
          </p>
        ) : (
          <p className="pb-hint">
            Paste a URL, or Upload to store as Base64. Default is placehold.co.
          </p>
        )}
      </div>

      <div className="pb-size-row">
        <label className="pb-field" htmlFor={widthId}>
          <span className="pb-field-label">
            Width <span className="pb-field-label-muted">(shared)</span>
          </span>
          <input
            id={widthId}
            type="text"
            value={width}
            placeholder="100% or 400px"
            aria-label="Image width"
            onChange={(e) => handlePatchSize({ width: e.target.value })}
          />
        </label>
        <label className="pb-field" htmlFor={heightId}>
          <span className="pb-field-label">
            Height <span className="pb-field-label-muted">(shared)</span>
          </span>
          <input
            id={heightId}
            type="text"
            value={height}
            placeholder="auto or 240px"
            aria-label="Image height"
            onChange={(e) => handlePatchSize({ height: e.target.value })}
          />
        </label>
      </div>

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
