import { useState, useRef, useEffect, type FC, type FormEvent } from "react";
import { ImageIcon, Video, X, Upload } from "lucide-react";

import {
  DEFAULT_MAX_UPLOAD_BYTES,
  sanitizeUrl,
} from "./security";
import type { EditorLocaleText } from "./locale";

interface MediaModalProps {
  type: "image" | "video";
  onClose: () => void;
  onInsert: (src: string, width?: string) => void;
  allowBase64?: boolean;
  maxUploadBytes?: number;
  onUpload?: (file: File) => Promise<string>;
  locale: EditorLocaleText;
  error?: string | null;
}

const SIZE_PRESETS = [
  { label: "S", value: "25%" },
  { label: "M", value: "50%" },
  { label: "L", value: "75%" },
  { label: "Full", value: "100%" },
];

export const MediaModal: FC<MediaModalProps> = ({
  type,
  onClose,
  onInsert,
  allowBase64 = false,
  maxUploadBytes = DEFAULT_MAX_UPLOAD_BYTES,
  onUpload,
  locale,
  error: externalError,
}) => {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState("100%");
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const isImage = type === "image";

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("input")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  const error = externalError || localError;

  const readFile = async (file: File) => {
    setLocalError(null);
    if (!isImage && !onUpload) {
      setLocalError("Video upload requires an onUpload handler (https URL).");
      return;
    }
    if (file.size > maxUploadBytes) {
      setLocalError(
        `File too large (max ${Math.round(maxUploadBytes / 1024)} KB).`,
      );
      return;
    }
    if (isImage && !file.type.startsWith("image/")) {
      setLocalError("Only image files are allowed.");
      return;
    }
    if (!isImage && !file.type.startsWith("video/")) {
      setLocalError("Only video files are allowed.");
      return;
    }

    if (onUpload) {
      setUploading(true);
      try {
        const remote = await onUpload(file);
        const safe = sanitizeUrl(remote, { allowDataImage: false });
        if (!safe) {
          setLocalError("Upload returned an invalid URL.");
          return;
        }
        setPreview(safe);
        setUrl("");
      } catch {
        setLocalError("Upload failed. Try again.");
      } finally {
        setUploading(false);
      }
      return;
    }

    if (!allowBase64) {
      setLocalError(
        "Local uploads require onUpload, or set allowBase64 for images.",
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setPreview(result);
        setUrl("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInsert = (e?: FormEvent) => {
    e?.preventDefault();
    const src = preview || url;
    if (!src) return;
    onInsert(src, isImage ? width : undefined);
  };

  const src = preview || url;
  const title = isImage ? locale.mediaImageTitle : locale.mediaVideoTitle;

  return (
    <div
      className="itzsa-editor-modal-backdrop fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="itzsa-editor-modal flex max-h-[90vh] w-full max-w-[460px] flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[var(--editor-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--editor-surface)] text-[var(--editor-muted)]">
              {isImage ? <ImageIcon size={15} /> : <Video size={15} />}
            </div>
            <span className="text-sm font-semibold">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-[var(--editor-muted)] hover:bg-[var(--editor-surface)]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleInsert} className="space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-[var(--editor-muted)] uppercase">
              {locale.mediaUrlLabel}
            </label>
            <input
              type="url"
              placeholder={`https://example.com/${isImage ? "image.jpg" : "video.mp4"}`}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setPreview(null);
                setLocalError(null);
              }}
              className="h-9 w-full rounded-lg border border-[var(--editor-border)] bg-[var(--editor-surface)] px-3 font-mono text-sm outline-none focus:border-[var(--editor-accent)] focus:ring-2 focus:ring-[var(--editor-ring)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--editor-border)]" />
            <span className="text-xs text-[var(--editor-muted-fg)]">or</span>
            <div className="h-px flex-1 bg-[var(--editor-border)]" />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-[var(--editor-muted)] uppercase">
              {locale.mediaUploadLabel}
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void readFile(file);
              }}
              disabled={uploading}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--editor-border)] p-6 transition-colors hover:border-[var(--editor-accent)] hover:bg-[var(--editor-surface)]"
            >
              <Upload size={20} className="text-[var(--editor-muted)]" />
              <p className="text-sm text-[var(--editor-muted)]">
                {uploading ? "Uploading…" : "Drag & drop or browse"}
              </p>
              <p className="text-[11px] text-[var(--editor-muted-fg)]">
                {isImage ? "PNG, JPG, GIF, WebP" : "MP4, WebM — via onUpload"}
              </p>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={isImage ? "image/png,image/jpeg,image/gif,image/webp" : "video/*"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void readFile(file);
              }}
              className="hidden"
            />
          </div>

          {isImage && src && (
            <div className="overflow-hidden rounded-lg border border-[var(--editor-border)] bg-[var(--editor-surface)]">
              <img
                src={src}
                alt=""
                className="mx-auto max-h-[160px] object-contain"
                style={{ width }}
              />
            </div>
          )}

          {isImage && (
            <div>
              <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-[var(--editor-muted)] uppercase">
                {locale.mediaSizeLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {SIZE_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setWidth(p.value)}
                    className={`h-8 rounded-lg px-3 text-sm font-medium transition-colors ${
                      width === p.value
                        ? "itzsa-editor-btn-primary"
                        : "itzsa-editor-btn"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-[var(--editor-danger)]" role="alert">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--editor-border)] bg-[var(--editor-surface)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="itzsa-editor-btn h-8 rounded-lg px-4 text-sm"
          >
            {locale.cancel}
          </button>
          <button
            type="button"
            onClick={() => handleInsert()}
            disabled={!src || uploading}
            className="itzsa-editor-btn-primary h-8 rounded-lg px-4 text-sm"
          >
            {locale.insert}
          </button>
        </div>
      </div>
    </div>
  );
};
