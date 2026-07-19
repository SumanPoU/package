export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "getting-started", label: "Getting started" },
  { id: "validation", label: "Validation" },
  { id: "examples", label: "Examples" },
  { id: "example-basic", label: "Basic picker", indent: true },
  { id: "example-editable", label: "Editable input", indent: true },
  { id: "example-range", label: "Date range", indent: true },
  { id: "example-styled", label: "Custom styling", indent: true },
  { id: "example-locale", label: "Locale", indent: true },
  { id: "example-bounds", label: "Min / max", indent: true },
  { id: "example-helpers", label: "AD ↔ BS helpers", indent: true },
  { id: "props", label: "Props API" },
  { id: "props-picker", label: "NepaliDatePicker", indent: true },
  { id: "props-editable", label: "EditableNepaliDatePicker", indent: true },
  { id: "props-range", label: "NepaliDateRangePicker", indent: true },
  { id: "props-helpers", label: "Helpers", indent: true },
  { id: "styling", label: "Styling & fonts" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
