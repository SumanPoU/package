import { ImageIcon, Upload, Video, X } from "lucide-react";
import {
  type FC,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "./lib/utils";
import type { EditorLocaleText } from "./locale";
import { sanitizeUrl } from "./security";
import {
  acceptAttr,
  type EditorMediaKind,
  formatBytes,
  type ResolvedMediaSettings,
  validateUploadFile,
} from "./upload";

interface MediaModalProps {
  type: EditorMediaKind;
  onClose: () => void;
  onInsert: (src: string, width?: string) => void;
  media: ResolvedMediaSettings;
  locale: EditorLocaleText;
  error?: string | null;
}

const SIZE_PRESETS = [
  { label: "S", value: "25%" },
  { label: "M", value: "50%" },
  { label: "L", value: "75%" },
  { label: "Full", value: "100%" },
] as const;

export const MediaModal: FC<MediaModalProps> = ({
  type,
  onClose,
  onInsert,
  media,
  locale,
  error: externalError,
}) => {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState("100%");
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isImage = type === "image";
  const canUpload = typeof media.onUpload === "function";
  const maxBytes = isImage ? media.maxImageBytes : media.maxVideoBytes;
  const accept = isImage ? media.acceptImage : media.acceptVideo;

  /** Only bind sanitized URLs to <img> — never raw typed input. */
  const safePreviewSrc = useMemo(() => {
    const candidate = preview || url;
    if (!candidate.trim()) return null;
    return sanitizeUrl(candidate, {
      allowDataImage: false,
      allowRelative: true,
    });
  }, [preview, url]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    dialogRef.current?.querySelector<HTMLElement>("input,button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      abortRef.current?.abort();
      prev?.focus?.();
    };
  }, [onClose]);

  const error = externalError || localError;

  const uploadFile = async (file: File) => {
    setLocalError(null);
    setProgress(0);

    if (!media.onUpload) {
      setLocalError(locale.mediaUploadMissing);
      return;
    }

    const check = validateUploadFile(file, type, media);
    if (!check.ok) {
      setLocalError(check.error);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setUploading(true);
    try {
      const remote = await media.onUpload(file, {
        kind: type,
        signal: ac.signal,
        onProgress: (p) => setProgress(Math.max(0, Math.min(1, p.ratio))),
      });

      if (ac.signal.aborted) return;

      const safe = sanitizeUrl(remote, {
        allowDataImage: false,
        allowRelative: true,
      });
      if (!safe || safe.startsWith("data:")) {
        setLocalError(locale.mediaUploadInvalidUrl);
        return;
      }
      setPreview(safe);
      setUrl("");
      setProgress(1);
    } catch (err) {
      if (ac.signal.aborted) return;
      const message =
        err instanceof Error && err.message
          ? err.message
          : locale.mediaUploadFailed;
      setLocalError(message);
    } finally {
      if (!ac.signal.aborted) setUploading(false);
    }
  };

  const handleInsert = (e?: FormEvent) => {
    e?.preventDefault();
    const src = preview || url;
    if (!src) return;
    if (!preview && !media.allowUrlInsert) {
      setLocalError(locale.mediaUrlDisabled);
      return;
    }
    onInsert(src, isImage ? width : undefined);
  };

  const src = preview || url;
  const canInsert = Boolean(src?.trim()) && (!!preview || media.allowUrlInsert);
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
        aria-labelledby="itzsa-media-modal-title"
        className="itzsa-editor-modal flex max-h-[min(90vh,640px)] w-full max-w-[440px] flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--editor-border)] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--editor-surface)] text-[var(--editor-muted)]">
              {isImage ? (
                <ImageIcon size={15} strokeWidth={1.75} />
              ) : (
                <Video size={15} strokeWidth={1.75} />
              )}
            </div>
            <h2
              id="itzsa-media-modal-title"
              className="truncate text-[14px] font-semibold tracking-tight text-[var(--editor-fg)]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--editor-muted)] transition-colors hover:bg-[var(--editor-surface)] hover:text-[var(--editor-fg)]"
            aria-label="Close"
          >
            <X size={15} strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleInsert} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-4 overflow-y-auto px-5 py-4">
            {media.allowUrlInsert && (
              <>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.12em] text-[var(--editor-muted)] uppercase">
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
                    className="h-10 w-full rounded-lg border border-[var(--editor-border)] bg-[var(--editor-surface)] px-3 font-mono text-[13px] text-[var(--editor-fg)] outline-none transition-[border,box-shadow] placeholder:text-[var(--editor-muted-fg)] focus:border-[var(--editor-accent)] focus:ring-2 focus:ring-[var(--editor-ring)]"
                  />
                </div>

                <div className="flex items-center gap-3" aria-hidden>
                  <div className="h-px flex-1 bg-[var(--editor-border)]" />
                  <span className="text-[11px] font-medium text-[var(--editor-muted-fg)]">
                    or
                  </span>
                  <div className="h-px flex-1 bg-[var(--editor-border)]" />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.12em] text-[var(--editor-muted)] uppercase">
                {locale.mediaUploadLabel}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!canUpload) {
                    setLocalError(locale.mediaUploadMissing);
                    return;
                  }
                  fileRef.current?.click();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (!canUpload) {
                    setLocalError(locale.mediaUploadMissing);
                    return;
                  }
                  const file = e.dataTransfer.files?.[0];
                  if (file) void uploadFile(file);
                }}
                disabled={uploading}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 transition-colors",
                  dragOver
                    ? "border-[var(--editor-accent)] bg-[color-mix(in_oklab,var(--editor-accent)_8%,transparent)]"
                    : "border-[var(--editor-border)] bg-[var(--editor-surface)] hover:border-[var(--editor-accent)] hover:bg-[var(--editor-surface-2)]",
                  "disabled:cursor-wait disabled:opacity-70",
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-[var(--editor-bg)] text-[var(--editor-muted)] shadow-sm ring-1 ring-[var(--editor-border)]">
                  <Upload size={18} strokeWidth={1.75} />
                </span>
                <p className="text-[13px] font-medium text-[var(--editor-fg)]">
                  {uploading
                    ? locale.mediaUploading
                    : canUpload
                      ? locale.mediaUploadHint
                      : locale.mediaUploadMissingShort}
                </p>
                <p className="text-[11px] text-[var(--editor-muted-fg)]">
                  {isImage ? "PNG, JPG, GIF, WebP" : "MP4, WebM, OGG"} · max{" "}
                  {formatBytes(maxBytes)}
                </p>
                {uploading && (
                  <div
                    className="mt-1 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-[var(--editor-border)]"
                    role="progressbar"
                    aria-valuenow={Math.round(progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--editor-accent)] transition-[width] duration-150"
                      style={{ width: `${Math.round(progress * 100)}%` }}
                    />
                  </div>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept={acceptAttr(accept)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void uploadFile(file);
                }}
                className="hidden"
              />
            </div>

            {isImage && safePreviewSrc && (
              <div className="overflow-hidden rounded-xl border border-[var(--editor-border)] bg-[var(--editor-surface)] p-2">
                <img
                  src={safePreviewSrc}
                  alt=""
                  className="mx-auto max-h-[140px] rounded-lg object-contain"
                  style={{ width }}
                />
              </div>
            )}

            {isImage && (
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold tracking-[0.12em] text-[var(--editor-muted)] uppercase">
                  {locale.mediaSizeLabel}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SIZE_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setWidth(p.value)}
                      className={cn(
                        "h-8 min-w-[2.75rem] rounded-lg px-3 text-[12px] font-medium transition-colors",
                        width === p.value
                          ? "itzsa-editor-btn-primary"
                          : "itzsa-editor-btn",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p
                className="rounded-lg bg-[var(--editor-danger-bg)] px-3 py-2 text-[12px] text-[var(--editor-danger)]"
                role="alert"
              >
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--editor-border)] bg-[var(--editor-surface)] px-5 py-3.5">
            <button
              type="button"
              onClick={onClose}
              className="itzsa-editor-btn h-9 rounded-lg px-4 text-[13px] font-medium"
            >
              {locale.cancel}
            </button>
            <button
              type="submit"
              disabled={!canInsert || uploading}
              className="itzsa-editor-btn-primary h-9 rounded-lg px-4 text-[13px] font-medium"
            >
              {locale.insert}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
