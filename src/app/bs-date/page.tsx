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
  title: "@itzsa/bs-date — Bikram Sambat date logic",
  description:
    "Headless Bikram Sambat convert, arithmetic, format, and holidays — pluggable calendar engines, no React. Install with pnpm add @itzsa/bs-date.",
  path: "/bs-date",
  packageName: "@itzsa/bs-date",
  keywords: [
    "bikram sambat",
    "nepali date",
    "bs calendar",
    "ad to bs",
    "headless",
  ],
});

export default function BsDateDocsPage() {
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
