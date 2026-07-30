import type { Metadata } from "next";

import { PackageJsonLd } from "@/components/package-json-ld";
import { buildPackageMetadata, getPackageByPath } from "@/lib/seo";

import { DocsContent } from "./docs-content";

const entry = getPackageByPath("/nrb-forex")!;

export const metadata: Metadata = buildPackageMetadata(entry);

export default function NrbForexDocsPage() {
  return (
    <>
      <PackageJsonLd entry={entry} />
      <DocsContent />
    </>
  );
}
