import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/captcha — Client & server trust models",
  description:
    "Company-standard React captcha: client generate+verify for UX friction, or server-issued challenges for login/checkout. Text, math (BODMAS), slider.",
  path: "/captcha",
  packageName: "@itzsa/captcha",
  keywords: [
    "captcha",
    "math captcha",
    "slider captcha",
    "server captcha",
    "bodmas",
    "bot prevention",
    "react",
    "itzsa",
  ],
});

export default function CaptchaDocsPage() {
  return <DocsContent />;
}
