import type { Metadata } from "next";

import { DocsContent } from "./docs-content";

export const metadata: Metadata = {
  title: "@itzsa/table — Documentation",
  description:
    "Install, configure, and use the @itzsa/table DataTable — full props, classNames, styles, localeText, and examples.",
};

export default function TableDocsPage() {
  return <DocsContent />;
}
