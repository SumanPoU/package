export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

/** Left sidebar + right “On this page” — keep in sync with section ids. */
export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "getting-started", label: "Getting started" },
  { id: "examples", label: "Examples" },
  { id: "example-full", label: "Full-featured", indent: true },
  { id: "example-row-edit", label: "Row editing", indent: true },
  { id: "example-tree", label: "Tree data", indent: true },
  { id: "example-locale", label: "Locale", indent: true },
  { id: "props", label: "Props API" },
  { id: "props-datatable", label: "DataTable", indent: true },
  { id: "props-column", label: "Column", indent: true },
  { id: "props-pagination", label: "Pagination", indent: true },
  { id: "props-actions", label: "Actions", indent: true },
  { id: "props-classnames", label: "classNames slots", indent: true },
  { id: "props-styles", label: "styles slots", indent: true },
  { id: "props-locale", label: "localeText", indent: true },
  { id: "styling", label: "CSS & theming" },
  { id: "features", label: "Feature map" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
