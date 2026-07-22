import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/nrb-forex — Nepal Rastra Bank forex client",
  description:
    "Typed NRB forex rate client — fetch, cache, and convert foreign currency to NPR with unit-aware math. Install with pnpm add @itzsa/nrb-forex.",
  path: "/nrb-forex",
  packageName: "@itzsa/nrb-forex",
  keywords: [
    "nrb",
    "forex",
    "nepal rastra bank",
    "exchange rate",
    "npr",
    "headless",
  ],
});

export default function NrbForexDocsPage() {
  return <DocsContent />;
}
