export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "demo", label: "Live demo" },
  { id: "installation", label: "Installation" },
  { id: "getting-started", label: "Getting started" },
  { id: "minimal", label: "Minimal (ref + onVerified)", indent: true },
  { id: "server-verify", label: "Server verify / API errors", indent: true },
  { id: "props", label: "Props" },
  { id: "props-core", label: "Core", indent: true },
  { id: "props-verify", label: "Verify & errors", indent: true },
  { id: "props-chrome", label: "Chrome & styling", indent: true },
  { id: "imperative", label: "Imperative API" },
  { id: "registry", label: "Registry" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
