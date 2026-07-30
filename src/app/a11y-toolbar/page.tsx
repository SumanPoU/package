import type { Metadata } from "next";

import { PackageJsonLd } from "@/components/package-json-ld";
import { buildPackageMetadata, getPackageByPath } from "@/lib/seo";

import { DocsContent } from "./docs-content";

const entry = getPackageByPath("/a11y-toolbar")!;

export const metadata: Metadata = buildPackageMetadata(entry);

export default function A11yToolbarDocsPage() {
  return (
    <>
      <PackageJsonLd entry={entry} />
      <DocsContent />
    </>
  );
}
