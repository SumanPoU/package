import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import type { CSSProperties } from "react";

import { buildMetadata } from "@/lib/seo";

import { DocsContent } from "./docs-content";

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

export const metadata: Metadata = buildMetadata({
  title: "@itzsa/nepal-geo — Nepal Geo",
  description:
    "Nepal provinces, districts, local levels (metropolitan, municipality, rural), and wards — cascade selects plus @itzsa/nepal-geo-data.",
  path: "/nepal-geo",
  packageName: "@itzsa/nepal-geo",
  keywords: [
    "nepal geography",
    "province",
    "district",
    "municipality",
    "ward",
    "metropolitan",
  ],
});

export default function NepalGeoDocsPage() {
  return (
    <div
      className={notoDevanagari.variable}
      style={
        {
          "--itzsa-nepali-font":
            "var(--font-noto-devanagari), 'Noto Sans Devanagari', var(--font-outfit), sans-serif",
        } as CSSProperties
      }
    >
      <DocsContent />
    </div>
  );
}
