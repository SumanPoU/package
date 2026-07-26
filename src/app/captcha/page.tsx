import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/captcha — Canvas captcha",
  description:
    "React canvas captcha with configurable length, theme, noise, and verification callbacks. npm or itzsa shadcn registry.",
  path: "/captcha",
  packageName: "@itzsa/captcha",
  keywords: ["captcha", "canvas", "verification", "react", "itzsa"],
});

export default function CaptchaDocsPage() {
  return <DocsContent />;
}
