export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "data", label: "Data helpers" },
  { id: "data-only", label: "Data-only package", indent: true },
  { id: "types-filters", label: "Local types & filters", indent: true },
  { id: "wards", label: "Wards", indent: true },
  { id: "examples", label: "Examples" },
  { id: "example-single", label: "Single select", indent: true },
  { id: "example-cascade", label: "Hierarchy + ward", indent: true },
  { id: "example-types", label: "Type filters", indent: true },
  { id: "example-style", label: "Custom CSS", indent: true },
  { id: "example-locale", label: "Locale", indent: true },
  { id: "styling", label: "Styling API" },
  { id: "props", label: "Props API" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
