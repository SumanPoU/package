export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const EDITOR_PROPS: PropRow[] = [
  {
    name: "value",
    type: "string",
    default: '""',
    description: "Controlled HTML content.",
  },
  {
    name: "onChange",
    type: "(html: string) => void",
    description: "Fires when the document HTML changes.",
  },
  {
    name: "onBlur / onFocus",
    type: "() => void",
    description: "Focus lifecycle callbacks.",
  },
  {
    name: "ref",
    type: "Ref<RichTextEditorHandle>",
    description:
      "Imperative API: getHTML, getJSON, getText, setContent, clear, focus, blur, isEmpty, getEditor.",
  },
  {
    name: "label",
    type: "string",
    description: "Optional visible label above the editor.",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Empty-document placeholder (also via settings / locale).",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables editing and toolbar actions.",
  },
  {
    name: "readOnly",
    type: "boolean",
    default: "false",
    description: "View-only content; toolbar stays mostly inactive.",
  },
  {
    name: "invalid",
    type: "boolean",
    default: "false",
    description: "Shows invalid / error border styling.",
  },
  {
    name: "nepali",
    type: '"unicode" | "preeti" | false',
    default: "false",
    description:
      "Enable Nepali transliteration input (requires @itzsa/nepali-input).",
  },
  {
    name: "maxLength",
    type: "number",
    description: "Soft character limit; status bar warns when reached.",
  },
  {
    name: "minHeight",
    type: "string",
    description: 'Editor surface min-height CSS value (e.g. "220px").',
  },
  {
    name: "compact",
    type: "boolean",
    default: "false",
    description: "Tighter toolbar and content padding.",
  },
  {
    name: "showStatusBar",
    type: "boolean",
    default: "true",
    description: "Word / character counts and limit messaging.",
  },
  {
    name: "allowHtmlMode",
    type: "boolean",
    default: "true",
    description: "Allow switching to raw HTML editing panel.",
  },
  {
    name: "sanitize",
    type: "boolean",
    default: "true",
    description:
      "Sanitize HTML on value, paste, setContent, and HTML mode apply.",
  },
  {
    name: "immediatelyRender",
    type: "boolean",
    default: "false",
    description: "TipTap immediatelyRender (prefer false under SSR / Next.js).",
  },
  {
    name: "onUpload",
    type: "EditorUploadHandler",
    description:
      "Host uploader for device files. Prefer settings.media.onUpload in production.",
  },
  {
    name: "maxUploadBytes",
    type: "number",
    description:
      "Deprecated — use settings.media.maxImageBytes / maxVideoBytes.",
  },
  {
    name: "toolbar",
    type: "EditorToolbarFeatures",
    description: "Toggle toolbar groups (history, headings, table, image, …).",
  },
  {
    name: "className",
    type: "string",
    description: "Root class name.",
  },
  {
    name: "classNames",
    type: "EditorClassNames",
    description: "Slots: root, toolbar, content, statusBar, htmlPanel.",
  },
  {
    name: "locale",
    type: "Partial<EditorLocaleText>",
    description: "Override toolbar / modal / status strings.",
  },
  {
    name: "extensions",
    type: "Extensions",
    description: "Extra TipTap extensions merged into the editor schema.",
  },
  {
    name: "settings",
    type: "EditorSettings",
    description:
      "Scalable config bag. Flat props merge with / override matching settings keys.",
  },
];

export const SETTINGS_PROPS: PropRow[] = [
  {
    name: "placeholder",
    type: "string",
    description: "Empty state placeholder text.",
  },
  {
    name: "nepali",
    type: '"unicode" | "preeti" | false',
    default: "false",
    description: "Nepali input mode for the document.",
  },
  {
    name: "maxLength",
    type: "number",
    description: "Character limit shown in the status bar.",
  },
  {
    name: "minHeight / compact",
    type: "string / boolean",
    description: "Layout density and content min-height.",
  },
  {
    name: "showStatusBar",
    type: "boolean",
    default: "true",
    description: "Show or hide the bottom status bar.",
  },
  {
    name: "allowHtmlMode",
    type: "boolean",
    default: "true",
    description: "Enable HTML source mode in the toolbar.",
  },
  {
    name: "sanitize",
    type: "boolean",
    default: "true",
    description: "Run HTML / URL sanitizers on ingress.",
  },
  {
    name: "immediatelyRender",
    type: "boolean",
    default: "false",
    description: "TipTap SSR-related render flag.",
  },
  {
    name: "toolbar",
    type: "EditorToolbarFeatures",
    description: "Per-feature toolbar flags (see toolbar table).",
  },
  {
    name: "classNames",
    type: "EditorClassNames",
    description: "Class name slots for chrome regions.",
  },
  {
    name: "locale",
    type: "Partial<EditorLocaleText>",
    description: "Partial locale string overrides.",
  },
  {
    name: "extensions",
    type: "Extensions",
    description: "Additional TipTap extensions.",
  },
  {
    name: "media",
    type: "EditorMediaSettings",
    description: "Upload handler, size limits, MIME accept lists, URL insert.",
  },
];

export const MEDIA_PROPS: PropRow[] = [
  {
    name: "onUpload",
    type: "EditorUploadHandler",
    description:
      "(file, { kind, signal, onProgress }) => Promise<httpsUrl>. Required for file pick / drag-drop.",
  },
  {
    name: "maxImageBytes",
    type: "number",
    default: "5MB",
    description: "Max image upload size in bytes.",
  },
  {
    name: "maxVideoBytes",
    type: "number",
    default: "50MB",
    description: "Max video upload size in bytes.",
  },
  {
    name: "acceptImage",
    type: "readonly string[]",
    default: "png/jpeg/gif/webp",
    description: "Allowed image MIME types.",
  },
  {
    name: "acceptVideo",
    type: "readonly string[]",
    default: "mp4/webm/ogg",
    description: "Allowed video MIME types.",
  },
  {
    name: "allowUrlInsert",
    type: "boolean",
    default: "true",
    description: "Allow pasting an https media URL without uploading a file.",
  },
];

export const TOOLBAR_PROPS: PropRow[] = [
  {
    name: "history",
    type: "boolean",
    default: "true",
    description: "Undo / redo.",
  },
  {
    name: "headings",
    type: "boolean",
    default: "true",
    description: "Heading level controls.",
  },
  {
    name: "fonts",
    type: "boolean",
    default: "true",
    description: "Font family / size controls.",
  },
  {
    name: "marks",
    type: "boolean",
    default: "true",
    description: "Bold, italic, underline, strike, highlight.",
  },
  {
    name: "color",
    type: "boolean",
    default: "true",
    description: "Text color picker.",
  },
  {
    name: "transform / script",
    type: "boolean",
    default: "true",
    description: "Case transform and sub/superscript.",
  },
  {
    name: "link / code / html",
    type: "boolean",
    default: "true",
    description: "Link popup, inline/block code, HTML mode toggle.",
  },
  {
    name: "align / lists / quote",
    type: "boolean",
    default: "true",
    description: "Alignment, lists, and blockquote.",
  },
  {
    name: "table / image / video / rule",
    type: "boolean",
    default: "true",
    description: "Insert table, image, video, horizontal rule.",
  },
];

export const CLASSNAMES_PROPS: PropRow[] = [
  {
    name: "root",
    type: "string",
    description: "Outer editor chrome.",
  },
  {
    name: "toolbar",
    type: "string",
    description: "Toolbar row.",
  },
  {
    name: "content",
    type: "string",
    description: "ProseMirror / EditorContent surface.",
  },
  {
    name: "statusBar",
    type: "string",
    description: "Bottom status bar.",
  },
  {
    name: "htmlPanel",
    type: "string",
    description: "Raw HTML mode panel.",
  },
];

export const HANDLE_PROPS: PropRow[] = [
  {
    name: "getHTML()",
    type: "() => string",
    description: "Current document as HTML.",
  },
  {
    name: "getJSON()",
    type: "() => Record<string, unknown>",
    description: "TipTap JSON document.",
  },
  {
    name: "getText()",
    type: "() => string",
    description: "Plain text content.",
  },
  {
    name: "setContent(html, options?)",
    type: "(html, { emitUpdate? }) => void",
    description: "Replace content; optionally emit onChange.",
  },
  {
    name: "clear()",
    type: "() => void",
    description: "Clear the document.",
  },
  {
    name: "focus() / blur()",
    type: "() => void",
    description: "Focus or blur the editor surface.",
  },
  {
    name: "isEmpty()",
    type: "() => boolean",
    description: "Whether the document is empty.",
  },
  {
    name: "getEditor()",
    type: "() => Editor | null",
    description: "Underlying TipTap instance (advanced).",
  },
];

export const SECURITY_HELPERS: PropRow[] = [
  {
    name: "sanitizeHtml",
    type: "(html: string) => string",
    description: "Sanitize HTML before storage or display.",
  },
  {
    name: "sanitizeUrl / validateLinkHref",
    type: "URL helpers",
    description:
      "Allowlist http(s) and relative URLs; block javascript: / data:.",
  },
  {
    name: "sanitizeCssLength",
    type: "(value: string) => string | null",
    description: "Safe CSS length for width / font-size attributes.",
  },
  {
    name: "validateMediaInsert",
    type: "media guard",
    description: "Validate media URLs before insert.",
  },
];
