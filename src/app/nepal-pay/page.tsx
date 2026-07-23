import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/nepal-pay — eSewa + Khalti payment SDK",
  description:
    "Unified TypeScript SDK for eSewa ePay v2 and Khalti KPG-2 with mandatory server-side verification, idempotent confirms, and pluggable stores. Install with pnpm add @itzsa/nepal-pay.",
  path: "/nepal-pay",
  packageName: "@itzsa/nepal-pay",
  keywords: [
    "esewa",
    "khalti",
    "payment",
    "nepal",
    "epay",
    "kpg-2",
    "headless",
  ],
});

export default function NepalPayDocsPage() {
  return <DocsContent />;
}
