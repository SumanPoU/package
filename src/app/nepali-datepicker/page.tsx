import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Noto_Sans_Devanagari } from "next/font/google";

import { DocsContent } from "./docs-content";

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-noto-devanagari",
});

export const metadata: Metadata = {
  title: "@itzsa/nepali-datepicker — Documentation",
  description:
    "Nepali (Bikram Sambat) date picker for React — install, examples, and AD↔BS helpers.",
};

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
