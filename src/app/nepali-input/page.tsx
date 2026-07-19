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
  title: "@itzsa/nepali-input — Nepali Input",
  description:
    "React Input and Textarea that transliterate Latin keystrokes to Nepali Devanagari using Unicode or Preeti layouts. Full props and examples.",
  path: "/nepali-input",
  packageName: "@itzsa/nepali-input",
  keywords: ["nepali", "preeti", "unicode", "devanagari", "transliteration"],
});

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
      <DocsContent />
    </div>
  );
}
