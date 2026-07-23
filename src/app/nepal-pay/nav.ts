export type NavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export const DOC_NAV: NavItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "installation", label: "Installation" },
  { id: "quick-start", label: "Quick start" },
  { id: "playground", label: "Test forms" },
  { id: "playground-checkout", label: "Unified checkout", indent: true },
  { id: "playground-diagrams", label: "Flow diagrams", indent: true },
  { id: "responses", label: "Responses" },
  { id: "responses-explorer", label: "Explorer", indent: true },
  { id: "responses-esewa", label: "eSewa payloads", indent: true },
  { id: "responses-khalti", label: "Khalti payloads", indent: true },
  { id: "responses-sdk", label: "SDK errors", indent: true },
  { id: "architecture", label: "Architecture" },
  { id: "state-machine", label: "State machine", indent: true },
  { id: "amounts", label: "Amount units", indent: true },
  { id: "idempotency", label: "Idempotency", indent: true },
  { id: "examples", label: "Examples" },
  { id: "example-flow", label: "Checkout flow", indent: true },
  { id: "example-esewa", label: "eSewa form POST", indent: true },
  { id: "example-khalti", label: "Khalti redirect", indent: true },
  { id: "example-return", label: "Return URL handler", indent: true },
  { id: "example-express", label: "Express", indent: true },
  { id: "example-next", label: "Next.js", indent: true },
  { id: "api", label: "Package API" },
  { id: "api-config", label: "Config & factories", indent: true },
  { id: "api-gateway", label: "PaymentGateway", indent: true },
  { id: "api-service", label: "PaymentService", indent: true },
  { id: "api-store", label: "PaymentStore", indent: true },
  { id: "api-errors", label: "Errors", indent: true },
  { id: "esewa", label: "eSewa (ePay v2)" },
  { id: "esewa-sign", label: "Signature", indent: true },
  { id: "esewa-status", label: "Status API", indent: true },
  { id: "esewa-divergence", label: "Docs divergence", indent: true },
  { id: "khalti", label: "Khalti (KPG-2)" },
  { id: "khalti-auth", label: "Auth header", indent: true },
  { id: "khalti-lookup", label: "Lookup", indent: true },
  { id: "scalability", label: "Scalability" },
  { id: "extending", label: "Custom gateways", indent: true },
  { id: "prisma", label: "Prisma store", indent: true },
  { id: "http", label: "HTTP timeouts", indent: true },
];

export const RIGHT_TOC = DOC_NAV.filter((item) => !item.indent);
