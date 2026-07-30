import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import type { CSSProperties } from "react";

import { PackageJsonLd } from "@/components/package-json-ld";
import { buildPackageMetadata, getPackageByPath } from "@/lib/seo";

import { DocsContent } from "./docs-content";

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

const entry = getPackageByPath("/nepali-input")!;

export const metadata: Metadata = buildPackageMetadata(entry);

export default function NepaliInputDocsPage() {
  return (
    <div
      className={notoDevanagari.variable}
      style={
        {
          "--itzsa-nepali-font":
            "var(--font-noto-devanagari), 'Noto Sans Devanagari', sans-serif",
        } as CSSProperties
      }
    >
      <PackageJsonLd entry={entry} />
      <DocsContent />
    </div>
  );
}
