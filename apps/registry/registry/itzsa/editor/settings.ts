import type { NepaliInputMode } from "@itzsa/nepali-input";
import type { Extensions } from "@tiptap/core";

import type { EditorLocaleText } from "./locale";
import type { EditorClassNames, EditorToolbarFeatures } from "./types";
import {
  type EditorMediaSettings,
  type ResolvedMediaSettings,
  resolveMediaSettings,
} from "./upload";

/**
 * Scalable editor configuration. Prefer this over many loose props
 * when wiring production apps.
 */
export type EditorSettings = {
  /** Controlled HTML (also available as top-level `value`). */
  placeholder?: string;
  nepali?: NepaliInputMode | false;
  maxLength?: number;
  minHeight?: string;
  compact?: boolean;
  showStatusBar?: boolean;
  allowHtmlMode?: boolean;
  /** Sanitize HTML / paste / setContent (default true). */
  sanitize?: boolean;
  /** Client-only TipTap render (default true). */
  immediatelyRender?: boolean;
  toolbar?: EditorToolbarFeatures;
  classNames?: EditorClassNames;
  locale?: Partial<EditorLocaleText>;
  extensions?: Extensions;
  /** Media upload + URL insert policy. */
  media?: EditorMediaSettings;
};

export type ResolvedEditorSettings = {
  placeholder?: string;
  nepali: NepaliInputMode | false;
  maxLength?: number;
  minHeight?: string;
  compact: boolean;
  showStatusBar: boolean;
  allowHtmlMode: boolean;
  sanitize: boolean;
  immediatelyRender: boolean;
  toolbar?: EditorToolbarFeatures;
  classNames?: EditorClassNames;
  locale?: Partial<EditorLocaleText>;
  extensions?: Extensions;
  media: ResolvedMediaSettings;
};

export type EditorSettingsInput = EditorSettings & {
  /** @deprecated Prefer `settings.media.onUpload` */
  onUpload?: EditorMediaSettings["onUpload"];
  /** @deprecated Prefer `settings.media.maxImageBytes` */
  maxUploadBytes?: number;
};

export function resolveEditorSettings(
  settings: EditorSettingsInput | undefined,
  flat: {
    placeholder?: string;
    nepali?: NepaliInputMode | false;
    maxLength?: number;
    minHeight?: string;
    compact?: boolean;
    showStatusBar?: boolean;
    allowHtmlMode?: boolean;
    sanitize?: boolean;
    immediatelyRender?: boolean;
    toolbar?: EditorToolbarFeatures;
    classNames?: EditorClassNames;
    locale?: Partial<EditorLocaleText>;
    extensions?: Extensions;
    onUpload?: EditorMediaSettings["onUpload"];
    maxUploadBytes?: number;
  },
): ResolvedEditorSettings {
  const s = settings ?? {};
  const media = resolveMediaSettings({
    ...s.media,
    onUpload: s.media?.onUpload ?? flat.onUpload ?? s.onUpload,
    maxImageBytes:
      s.media?.maxImageBytes ?? flat.maxUploadBytes ?? s.maxUploadBytes,
    maxVideoBytes: s.media?.maxVideoBytes,
  });

  return {
    placeholder: flat.placeholder ?? s.placeholder,
    nepali: flat.nepali ?? s.nepali ?? false,
    maxLength: flat.maxLength ?? s.maxLength,
    minHeight: flat.minHeight ?? s.minHeight,
    compact: flat.compact ?? s.compact ?? false,
    showStatusBar: flat.showStatusBar ?? s.showStatusBar ?? true,
    allowHtmlMode: flat.allowHtmlMode ?? s.allowHtmlMode ?? true,
    sanitize: flat.sanitize ?? s.sanitize ?? true,
    immediatelyRender: flat.immediatelyRender ?? s.immediatelyRender ?? false,
    toolbar: flat.toolbar ?? s.toolbar,
    classNames: flat.classNames ?? s.classNames,
    locale: flat.locale ?? s.locale,
    extensions: flat.extensions ?? s.extensions,
    media,
  };
}
