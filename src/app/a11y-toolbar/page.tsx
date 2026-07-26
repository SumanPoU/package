import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/a11y-toolbar — Accessibility preference toolbar",
  description:
    "React accessibility tools panel — text size, contrast, spacing, motion, i18n, and reading aids with localStorage persistence. Full props and behavior reference.",
  path: "/a11y-toolbar",
  packageName: "@itzsa/a11y-toolbar",
  keywords: ["accessibility", "a11y", "toolbar", "preferences", "wcag", "i18n"],
});

export default function A11yToolbarDocsPage() {
  return <DocsContent />;
}
