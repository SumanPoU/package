export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "What is this?" },
  { id: "how-it-works", label: "How it works" },
  { id: "installation", label: "Install" },
  { id: "quick-start", label: "Your first editor" },
  { id: "data-model", label: "How a page is stored" },
  { id: "visibility", label: "Show or hide blocks" },
  { id: "register-blocks", label: "Register new blocks" },
  { id: "author-css", label: "Format page CSS" },
  { id: "images", label: "Images & media" },
  { id: "locales", label: "Languages" },
  { id: "capabilities", label: "Turn features on/off" },
  { id: "host-ui", label: "Hide code & host UI" },
  { id: "editor-theme", label: "Theme the editor panels" },
  { id: "render-parity", label: "Same look everywhere" },
  { id: "page-builder-api", label: "Editor settings (API)" },
  { id: "host-callbacks", label: "What your app must do" },
  { id: "presets", label: "Ready-made layouts" },
  { id: "data-binding", label: "Lists from your data" },
  { id: "model-b", label: "Custom widgets (Model B)" },
  { id: "glossary", label: "Glossary" },
  { id: "guides", label: "Next steps" },
];
