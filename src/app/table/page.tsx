import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/table — DataTable",
  description:
    "Composable React DataTable with sorting, pagination, filters, selection, editing, export, and tree data. Full props, classNames, styles, and localeText docs.",
  path: "/table",
  packageName: "@itzsa/table",
  keywords: [
    "datatable",
    "react table",
    "tanstack",
    "shadcn table",
    "pagination",
  ],
});

export default function TableDocsPage() {
  return <DocsContent />;
}
