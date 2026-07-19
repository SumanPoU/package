export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "demo", label: "Live demo" },
  { id: "starter", label: "Starter" },
  { id: "uploads", label: "Uploads" },
  { id: "settings", label: "Settings" },
  { id: "security", label: "Security" },
  { id: "props", label: "Props API" },
  { id: "props-editor", label: "RichTextEditor", indent: true },
  { id: "props-toolbar", label: "Toolbar features", indent: true },
  { id: "props-classnames", label: "Class names", indent: true },
  { id: "props-handle", label: "Ref handle", indent: true },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
