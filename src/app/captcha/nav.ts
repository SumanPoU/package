export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "demo", label: "Live playground" },
  { id: "trust-models", label: "Trust models" },
  { id: "installation", label: "Installation" },
  { id: "getting-started", label: "Getting started" },
  { id: "minimal", label: "Client generate + verify", indent: true },
  { id: "server-trusted", label: "Server challenge + verify", indent: true },
  { id: "minimal-text", label: "Client text (canvas)", indent: true },
  { id: "examples", label: "Examples" },
  { id: "example-text", label: "Client · Text", indent: true },
  { id: "example-math", label: "Client · Math", indent: true },
  { id: "example-slider", label: "Client · Slider", indent: true },
  { id: "example-secure", label: "Server · Math", indent: true },
  {
    id: "example-math-headless",
    label: "Math engine (headless)",
    indent: true,
  },
  { id: "security", label: "Production security" },
  { id: "security-api", label: "Challenge + verify API", indent: true },
  { id: "security-express", label: "Express sample", indent: true },
  { id: "props", label: "Props" },
  { id: "props-core", label: "Captcha (text)", indent: true },
  { id: "props-math", label: "MathCaptcha", indent: true },
  { id: "props-slider", label: "SliderCaptcha", indent: true },
  { id: "props-verify", label: "Verify & errors", indent: true },
  { id: "props-chrome", label: "Chrome & styling", indent: true },
  { id: "imperative", label: "Imperative API" },
  { id: "registry", label: "Registry" },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
