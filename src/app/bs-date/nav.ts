export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "quick-start", label: "Quick start" },
  { id: "convert", label: "Convert" },
  { id: "arithmetic", label: "Arithmetic" },
  { id: "calendar", label: "Calendar" },
  { id: "format", label: "Format" },
  { id: "holidays", label: "Holidays" },
  { id: "engine", label: "Engine & scale" },
  { id: "engine-isolated", label: "Isolated engines", indent: true },
  { id: "engine-calendar", label: "Extend calendar", indent: true },
  { id: "examples", label: "Examples" },
  { id: "example-convert", label: "Convert live", indent: true },
  { id: "example-age", label: "Age / tenure", indent: true },
  { id: "example-holidays", label: "Month holidays", indent: true },
  { id: "api", label: "API reference" },
  { id: "limits", label: "Data & limits" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
