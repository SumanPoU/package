export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextAlignValue = "left" | "center" | "right" | "justify";
export type MediaModalType = "image" | "video" | null;

export type EditorToolbarFeatures = {
  history?: boolean;
  headings?: boolean;
  fonts?: boolean;
  marks?: boolean;
  color?: boolean;
  transform?: boolean;
  script?: boolean;
  link?: boolean;
  code?: boolean;
  html?: boolean;
  align?: boolean;
  lists?: boolean;
  quote?: boolean;
  table?: boolean;
  image?: boolean;
  video?: boolean;
  rule?: boolean;
};

export const DEFAULT_TOOLBAR_FEATURES: Required<EditorToolbarFeatures> = {
  history: true,
  headings: true,
  fonts: true,
  marks: true,
  color: true,
  transform: true,
  script: true,
  link: true,
  code: true,
  html: true,
  align: true,
  lists: true,
  quote: true,
  table: true,
  image: true,
  video: true,
  rule: true,
};

export type EditorClassNames = {
  root?: string;
  toolbar?: string;
  content?: string;
  statusBar?: string;
  htmlPanel?: string;
};

/** Imperative handle for forms and parent control. */
export type RichTextEditorHandle = {
  getHTML: () => string;
  getJSON: () => Record<string, unknown>;
  getText: () => string;
  setContent: (html: string, options?: { emitUpdate?: boolean }) => void;
  clear: () => void;
  focus: () => void;
  blur: () => void;
  isEmpty: () => boolean;
  /** Underlying TipTap editor instance (advanced). */
  getEditor: () => import("@tiptap/react").Editor | null;
};
