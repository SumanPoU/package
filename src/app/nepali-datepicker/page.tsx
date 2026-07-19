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
  title: "@itzsa/nepali-datepicker — BS Datepicker",
  description:
    "Nepali (Bikram Sambat) date, datetime, and range pickers for React with validation, AD↔BS helpers, and styling API.",
  path: "/nepali-datepicker",
  packageName: "@itzsa/nepali-datepicker",
  keywords: [
    "bikram sambat",
    "nepali calendar",
    "bs datepicker",
    "datetime",
    "date range",
  ],
});

export default function NepaliDatepickerDocsPage() {
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
