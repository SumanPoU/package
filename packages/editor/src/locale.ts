export type EditorLocaleText = {
  placeholder: string;
  undo: string;
  redo: string;
  bold: string;
  italic: string;
  underline: string;
  strike: string;
  highlight: string;
  link: string;
  unlink: string;
  code: string;
  codeBlock: string;
  blockquote: string;
  bulletList: string;
  orderedList: string;
  taskList: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  alignJustify: string;
  insertImage: string;
  insertVideo: string;
  insertTable: string;
  horizontalRule: string;
  htmlMode: string;
  visualMode: string;
  htmlBanner: string;
  htmlApply: string;
  languageBlockNe: string;
  languageBlockEn: string;
  word: string;
  words: string;
  character: string;
  characters: string;
  limitReached: string;
  linkInvalid: string;
  linkPlaceholder: string;
  mediaImageTitle: string;
  mediaVideoTitle: string;
  mediaUrlLabel: string;
  mediaUploadLabel: string;
  mediaSizeLabel: string;
  cancel: string;
  insert: string;
  tableTitle: string;
  tableRows: string;
  tableCols: string;
  tableInsert: string;
};

export const DEFAULT_LOCALE: EditorLocaleText = {
  placeholder: "Start writing…",
  undo: "Undo (Ctrl+Z)",
  redo: "Redo (Ctrl+Y)",
  bold: "Bold (Ctrl+B)",
  italic: "Italic (Ctrl+I)",
  underline: "Underline (Ctrl+U)",
  strike: "Strikethrough",
  highlight: "Highlight",
  link: "Insert / edit link",
  unlink: "Remove link",
  code: "Inline code",
  codeBlock: "Code block",
  blockquote: "Blockquote",
  bulletList: "Bullet list",
  orderedList: "Numbered list",
  taskList: "Task list",
  alignLeft: "Align left",
  alignCenter: "Center",
  alignRight: "Align right",
  alignJustify: "Justify",
  insertImage: "Insert image",
  insertVideo: "Insert video",
  insertTable: "Insert table",
  horizontalRule: "Horizontal rule",
  htmlMode: "HTML source",
  visualMode: "Visual editor",
  htmlBanner: "HTML Source — edit then apply to switch back",
  htmlApply: "Apply & switch to Visual",
  languageBlockNe: "यो फिल्डमा नेपाली (देवनागरी) मात्र लेख्न सकिन्छ।",
  languageBlockEn: "Only English (Latin) text is allowed in this field.",
  word: "word",
  words: "words",
  character: "character",
  characters: "characters",
  limitReached: "Character limit reached",
  linkInvalid: "Invalid URL",
  linkPlaceholder: "https://example.com",
  mediaImageTitle: "Insert image",
  mediaVideoTitle: "Insert video",
  mediaUrlLabel: "Paste URL",
  mediaUploadLabel: "Upload from device",
  mediaSizeLabel: "Size",
  cancel: "Cancel",
  insert: "Insert",
  tableTitle: "Insert table",
  tableRows: "Rows",
  tableCols: "Columns",
  tableInsert: "Insert table",
};

export function mergeLocale(
  overrides?: Partial<EditorLocaleText>,
): EditorLocaleText {
  return { ...DEFAULT_LOCALE, ...overrides };
}
