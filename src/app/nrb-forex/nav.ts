export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "quick-start", label: "Quick start" },
  { id: "nrb-api", label: "NRB Forex API" },
  { id: "nrb-rates", label: "GET /rates", indent: true },
  { id: "nrb-response", label: "Response shape", indent: true },
  { id: "nrb-errors", label: "Status & errors", indent: true },
  { id: "api", label: "Package API" },
  { id: "convert", label: "Convert & units", indent: true },
  { id: "cache", label: "Caching", indent: true },
  { id: "errors", label: "Errors", indent: true },
  { id: "examples", label: "Examples" },
  { id: "example-rates", label: "Latest rates", indent: true },
  { id: "example-convert", label: "Convert to NPR", indent: true },
  { id: "example-history", label: "Rate history", indent: true },
  { id: "example-currencies", label: "Published rates", indent: true },
  { id: "node", label: "Node / CLI" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
