export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "getting-started", label: "Getting started" },
  { id: "examples", label: "Examples" },
  { id: "example-unicode", label: "Unicode mode", indent: true },
  { id: "example-preeti", label: "Preeti mode", indent: true },
  { id: "example-toggle", label: "Enable / disable", indent: true },
  { id: "example-helpers", label: "toNepali helper", indent: true },
  { id: "props", label: "Props API" },
  { id: "props-input", label: "NepaliInput", indent: true },
  { id: "props-textarea", label: "NepaliTextarea", indent: true },
  { id: "props-helpers", label: "Helpers", indent: true },
  { id: "styling", label: "Styling & fonts" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
