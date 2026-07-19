export type {
  RichTextEditorProps,
  RichTextEditorHandle,
} from "./RichTextEditor";
export { RichTextEditor } from "./RichTextEditor";

export { useEditorConfig } from "./useEditorConfig";
export type { UseEditorConfigOptions } from "./useEditorConfig";

export { createNepaliInputExtension } from "./NepaliInputExtension";
export { LanguageGuard } from "./LanguageGuard";
export type { LanguageGuardOptions } from "./LanguageGuard";
export { Video } from "./video-extension";

export {
  sanitizeHtml,
  sanitizeUrl,
  sanitizeCssLength,
  validateLinkHref,
  validateMediaInsert,
  DEFAULT_MAX_BASE64_BYTES,
  DEFAULT_MAX_UPLOAD_BYTES,
} from "./security";

export type { EditorLocaleText } from "./locale";
export { DEFAULT_LOCALE, mergeLocale } from "./locale";

export type {
  HeadingLevel,
  TextAlignValue,
  MediaModalType,
  EditorToolbarFeatures,
  EditorClassNames,
} from "./types";
export { DEFAULT_TOOLBAR_FEATURES } from "./types";

export type {
  EditorSettings,
  ResolvedEditorSettings,
} from "./settings";
export { resolveEditorSettings } from "./settings";

export type {
  EditorMediaKind,
  EditorMediaSettings,
  EditorUploadHandler,
  EditorUploadContext,
  EditorUploadProgress,
  ResolvedMediaSettings,
} from "./upload";
export {
  resolveMediaSettings,
  validateUploadFile,
  formatBytes,
  DEFAULT_ACCEPT_IMAGE,
  DEFAULT_ACCEPT_VIDEO,
  DEFAULT_MAX_IMAGE_BYTES,
  DEFAULT_MAX_VIDEO_BYTES,
} from "./upload";

export {
  COLORS,
  FONT_FAMILIES,
  FONT_SIZES,
  HEADING_FONT_SIZE_MAP,
  HEADING_OPTIONS,
} from "./constants";
