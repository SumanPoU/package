"use client";

import { useId, useRef, useState } from "react";

import { usePageBuilderHost } from "../editor/hostContext";

const MAX_BASE64_BYTES = 1_500_000;

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

export type MediaUrlFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  hint?: string;
  id?: string;
  /** When true, empty blur restores placeholder as value. */
  fallbackOnEmpty?: string;
  /** File input accept. Default image/*. */
  accept?: string;
  /** When false, skip image/* type check (e.g. video upload). */
  requireImageMime?: boolean;
};

/** Shared Image URL + Upload (CDN via uploadAsset, else Base64). */
export const MediaUrlField = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  id: idProp,
  fallbackOnEmpty,
  accept = "image/*",
  requireImageMime = true,
}: MediaUrlFieldProps) => {
  const { uploadAsset } = usePageBuilderHost();
  const autoId = useId();
  const srcId = idProp ?? autoId;
  const fileId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (requireImageMime && !file.type.startsWith("image/")) {
      setStatus("Choose an image file (PNG, JPG, WebP, GIF, …).");
      return;
    }
    setIsBusy(true);
    setStatus(null);
    try {
      if (uploadAsset) {
        const { url } = await uploadAsset(file);
        onChange(url);
        setStatus("Uploaded to CDN / media store.");
        return;
      }
      if (file.size > MAX_BASE64_BYTES) {
        setStatus(
          "File is too large for Base64. Provide uploadAsset (CDN) or use a smaller file.",
        );
        return;
      }
      onChange(await fileToDataUrl(file));
      setStatus("Converted to Base64 (no uploadAsset configured).");
    } catch {
      setStatus("Upload / convert failed.");
    } finally {
      setIsBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="pb-field">
      <span className="pb-field-label" id={`${srcId}-label`}>
        {label}
      </span>
      <div className="pb-media-row">
        <input
          id={srcId}
          type="text"
          value={value}
          placeholder={placeholder}
          aria-labelledby={`${srcId}-label`}
          onChange={(e) => {
            setStatus(null);
            onChange(e.target.value);
          }}
          onBlur={() => {
            if (fallbackOnEmpty !== undefined && value.trim() === "") {
              onChange(fallbackOnEmpty);
            }
          }}
        />
        <input
          ref={fileRef}
          id={fileId}
          type="file"
          accept={accept}
          hidden
          aria-label={`Upload ${label}`}
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          className="pb-media-upload"
          disabled={isBusy}
          aria-label={`Upload ${label}`}
          onClick={() => fileRef.current?.click()}
        >
          {isBusy ? "…" : "Upload"}
        </button>
      </div>
      {status ? (
        <p className="pb-hint" role="status">
          {status}
        </p>
      ) : (
        <p className="pb-hint">
          {hint ??
            (uploadAsset
              ? "Paste a URL, or Upload via host CDN."
              : "Paste a URL, or Upload as Base64.")}
        </p>
      )}
    </div>
  );
};
