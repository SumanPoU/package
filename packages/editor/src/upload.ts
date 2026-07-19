/**
 * Upload contract for @itzsa/editor.
 * File uploads never become base64 — the host app returns a durable https URL.
 */

export type EditorMediaKind = "image" | "video";

export type EditorUploadProgress = {
  /** 0–1 */
  ratio: number;
  loaded?: number;
  total?: number;
};

export type EditorUploadContext = {
  kind: EditorMediaKind;
  /** Abort when the modal closes or the user cancels. */
  signal: AbortSignal;
  /** Optional progress callback (host may ignore). */
  onProgress: (progress: EditorUploadProgress) => void;
};

/**
 * Host-provided uploader. Must resolve to a public `https://` (or same-origin `/`) URL.
 * Never return a data: or blob: URL for production content.
 */
export type EditorUploadHandler = (
  file: File,
  context: EditorUploadContext,
) => Promise<string>;

export const DEFAULT_ACCEPT_IMAGE = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
] as const;

export const DEFAULT_ACCEPT_VIDEO = [
  "video/mp4",
  "video/webm",
  "video/ogg",
] as const;

/** Default 5 MB images / 50 MB video. */
export const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const DEFAULT_MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export type EditorMediaSettings = {
  /**
   * Required for file pick / drag-drop uploads.
   * URL paste still works when `allowUrlInsert` is true.
   */
  onUpload?: EditorUploadHandler;
  /** Max image upload size in bytes (default 5MB). */
  maxImageBytes?: number;
  /** Max video upload size in bytes (default 50MB). */
  maxVideoBytes?: number;
  /** Allowed image MIME types. */
  acceptImage?: readonly string[];
  /** Allowed video MIME types. */
  acceptVideo?: readonly string[];
  /** Allow inserting media by pasting an https URL (default true). */
  allowUrlInsert?: boolean;
};

export type ResolvedMediaSettings = {
  onUpload?: EditorUploadHandler;
  maxImageBytes: number;
  maxVideoBytes: number;
  acceptImage: readonly string[];
  acceptVideo: readonly string[];
  allowUrlInsert: boolean;
};

export function resolveMediaSettings(
  media?: EditorMediaSettings,
): ResolvedMediaSettings {
  return {
    onUpload: media?.onUpload,
    maxImageBytes: media?.maxImageBytes ?? DEFAULT_MAX_IMAGE_BYTES,
    maxVideoBytes: media?.maxVideoBytes ?? DEFAULT_MAX_VIDEO_BYTES,
    acceptImage: media?.acceptImage ?? DEFAULT_ACCEPT_IMAGE,
    acceptVideo: media?.acceptVideo ?? DEFAULT_ACCEPT_VIDEO,
    allowUrlInsert: media?.allowUrlInsert ?? true,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

export function validateUploadFile(
  file: File,
  kind: EditorMediaKind,
  settings: ResolvedMediaSettings,
): { ok: true } | { ok: false; error: string } {
  const accept = kind === "image" ? settings.acceptImage : settings.acceptVideo;
  const max =
    kind === "image" ? settings.maxImageBytes : settings.maxVideoBytes;

  if (file.size > max) {
    return {
      ok: false,
      error: `File too large (max ${formatBytes(max)}).`,
    };
  }

  const type = (file.type || "").toLowerCase();
  const allowed = accept.some((a) => {
    const t = a.toLowerCase();
    if (t.endsWith("/*")) return type.startsWith(t.slice(0, -1));
    return type === t;
  });

  if (!allowed) {
    return {
      ok: false,
      error:
        kind === "image"
          ? "Only PNG, JPG, GIF, or WebP images are allowed."
          : "Only MP4, WebM, or OGG video is allowed.",
    };
  }

  return { ok: true };
}

export function acceptAttr(mimes: readonly string[]): string {
  return mimes.join(",");
}
