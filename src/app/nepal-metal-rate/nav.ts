export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "quick-start", label: "Quick start" },
  { id: "sources", label: "Sources" },
  { id: "pipeline", label: "Pipeline", indent: true },
  { id: "extending", label: "Adding APIs", indent: true },
  { id: "persistence", label: "Persistence" },
  { id: "cron", label: "Cron" },
  { id: "security", label: "Security" },
  { id: "api", label: "Package API" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
