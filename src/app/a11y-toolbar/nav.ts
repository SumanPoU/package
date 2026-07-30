export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "how-it-works", label: "How it works" },
  { id: "getting-started", label: "Getting started" },
  { id: "example-react", label: "React (Next.js)", indent: true },
  { id: "example-vite", label: "Vite + React", indent: true },
  { id: "shortcuts", label: "Keyboard shortcuts" },
  { id: "features", label: "Features" },
  { id: "features-display", label: "Display", indent: true },
  { id: "features-motion", label: "Motion & assist", indent: true },
  { id: "props", label: "Props API" },
  { id: "props-toolbar", label: "A11yToolbar", indent: true },
  { id: "props-theme", label: "theme & styles", indent: true },
  { id: "props-i18n", label: "i18n", indent: true },
  { id: "props-placement", label: "Placement & size", indent: true },
  { id: "wcag", label: "Web accessibility (WCAG)" },
  { id: "behavior", label: "Behavior & patterns" },
  { id: "headless", label: "Headless / FOUC" },
  { id: "wordpress", label: "WordPress / CDN" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
